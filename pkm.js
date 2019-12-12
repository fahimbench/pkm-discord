require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const Discord = require('discord.js');
const request = require('request');
const fs = require('fs');
const helpers = require('./helpers');
const pkmObj = require('./PkmModel');
const Db = require('tingodb')().Db;

//Client Discord
const client = new Discord.Client();
const loginUrl = 'https://discordapp.com/api/v6/auth/login';
const parameters =  {email:process.env.DISCORD_EMAIL,password:process.env.DISCORD_PASSWORD,undelete:false,captcha_key:null,login_source:null,gift_code_sku_id:null};
let pkmChannel = {id: process.env.DISCORD_PKM_CHANNEL};
let pokemitch = {id: process.env.DISCORD_PKCORD_BOT};

//DATABASE
let db = new Db('database', {});
let pkmCollection = db.collection("pkmdb");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if(msg.channel.id === pkmChannel.id && msg.author.id === pokemitch.id){
        try {
            if(typeof msg.embeds[0].title != 'undefined' && msg.embeds[0].title === '‌‌A wild pokémon has аppeаred!'){
                request.get(msg.embeds[0].image.url, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        let shasum = crypto.createHash('sha256').update(body).digest('hex');
                        pkmCollection.findOne({ 'pkm.hash' : { $eq: shasum }}, function(err, result){
                            if(result !== null){
                                if(result.pkm.name){
                                    msg.channel.startTyping();
                                    setTimeout(() => {
                                        let pokename = require('./pokename.json');
                                        let find = helpers.findPkmById(parseInt(result.pkm.name), pokename);
                                        msg.channel.send('p!catch ' + find.original);
                                        msg.channel.stopTyping();
                                    }, helpers.getRandomInt(5000));
                                }
                            }else{
                                helpers.download(msg.embeds[0].image.url, 'images/'+ shasum +'.png');
                                let pkm = (new pkmObj(shasum +'.png', shasum, null)).getObj();
                                pkmCollection.insert([{pkm}]);
                            }
                        });
                    }
                });
            }
        }catch (e) {
            console.error(e);
        }
    }
});

axios.post(loginUrl, parameters).then(r => {
    client.login(r.data.token);
});

