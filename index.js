require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const Discord = require('discord.js');
const request = require('request');
const fs = require('fs');
const helpers = require('./helpers');
const pkmObj = require('./PkmModel');
const server = require('./client');
const Db = require('tingodb')().Db;

//Server
const port = process.env.PORT || 8080;
const loginUrl = 'https://discordapp.com/api/v6/auth/login';
let pokemitch = {id: process.env.DISCORD_PKCORD_BOT};

//Client Discord SLAVE
const client_slave = new Discord.Client();
const parameters_slave =  {email:process.env.DISCORD_SLAVE_EMAIL,password:process.env.DISCORD_SLAVE_PASSWORD,undelete:false,captcha_key:null,login_source:null,gift_code_sku_id:null};
let pkmChannel_slave = {id: process.env.DISCORD_SLAVE_PKM_CHANNEL};


//Client Discord MASTER
const client_master = new Discord.Client();
const parameters_master =  {email:process.env.DISCORD_MASTER_EMAIL,password:process.env.DISCORD_MASTER_PASSWORD,undelete:false,captcha_key:null,login_source:null,gift_code_sku_id:null};
let pkmChannel_master = {id: process.env.DISCORD_MASTER_PKM_CHANNEL};


//DATABASE
let db = new Db('database', {});
let pkmCollection = db.collection(process.env.DATABASE_NAME || 'pkmdb');

client_slave.on('ready', () => {
    server.listen(port);
    console.log(`Server Started port ${port}!`);
    console.log(`Logged in as ${client_slave.user.tag}!`);
    setInterval(function(){client_slave.channels.get(pkmChannel_slave.id).send(helpers.makeid(helpers.getRandomInt(5,40)))}, 1500);
});

client_slave.on('message', msg => {
    try {
        if(msg.channel.id === pkmChannel_slave.id && msg.author.id === pokemitch.id && msg.embeds[0].title !== undefined) {
            let title = msg.embeds[0].title;
            let regex = /\s*‌‌A wild pokémon has аppeаred!/g
            if (title.match(regex) && title.match(regex).length > 0) {
                request.get(msg.embeds[0].image.url, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        let shasum = crypto.createHash('sha256').update(body).digest('hex');
                        pkmCollection.findOne({'pkm.hash': {$eq: shasum}}, async function (err, result) {
                            if (result !== null) {
                                if (result.pkm.name) {
                                    msg.channel.startTyping();
                                    setTimeout(() => {
                                        msg.channel.send('p!catch ' + result.pkm.name.toLowerCase());
                                        msg.channel.stopTyping();
                                    }, helpers.getRandomInt(3000, 5000));
                                }
                            } else {
                                helpers.download(msg.embeds[0].image.url, 'static/images/' + shasum + '.png');
                                let pkm = (new pkmObj(shasum + '.png', shasum, null)).getObj();
                                pkmCollection.insert([{pkm}]);
                            }
                        });
                    }
                });
            }
        }
    }catch (e) {

    }
});

client_master.on('ready', function(){
    console.log(`Logged in as ${client_master.user.tag}!`);
});

client_master.on('message', msg => {
    try {
        if(msg.channel.id === pkmChannel_master.id && msg.author.id === pokemitch.id && msg.embeds[0].title !== undefined) {
            let title = msg.embeds[0].title;
            let regex = /\s*‌‌A wild pokémon has аppeаred!/g
            if (title.match(regex) && title.match(regex).length > 0) {
                request.get(msg.embeds[0].image.url, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        let shasum = crypto.createHash('sha256').update(body).digest('hex');
                        pkmCollection.findOne({'pkm.hash': {$eq: shasum}}, async function (err, result) {
                            if (result !== null) {
                                if (result.pkm.name) {
                                    msg.channel.startTyping();
                                    setTimeout(() => {
                                        if(helpers.getRandomInt(0, 100) <= 40){
                                            msg.channel.send('p!catch ' + result.pkm.name);
                                        }
                                        msg.channel.stopTyping();
                                    }, helpers.getRandomInt(3000, 5000));
                                }
                            } else {
                                helpers.download(msg.embeds[0].image.url, 'static/images/' + shasum + '.png');
                                let pkm = (new pkmObj(shasum + '.png', shasum, null)).getObj();
                                pkmCollection.insert([{pkm}]);
                            }
                        });
                    }
                });
            }
        }
    }catch (e) {

    }
});

let r1 = function(){
    axios.post(loginUrl, parameters_slave).then(r => {
        client_slave.login(r.data.token);
    }).catch(()=>r1());
}

let r2 = function() {
    axios.post(loginUrl, parameters_master).then(r => {
        client_master.login(r.data.token);
    }).catch(()=>r2());
}

r1();
// r2();
