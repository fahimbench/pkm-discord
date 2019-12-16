const mustacheExpress = require('mustache-express');
const fs = require('fs');
const Db = require('tingodb')().Db;
const helpers = require('./helpers');
const express = require('express');
const app = express();
app.use("/images", express.static(__dirname + '/static/images'));
app.use("/css", express.static(__dirname + '/static/css'));
app.use("/js", express.static(__dirname + '/static/js'));
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views',  __dirname + '/static/views');

app
    .get('/', function(req, res) {
        res.setHeader('Content-Type', 'text/plain');
        res.send('Vous êtes à l\'accueil');
    })

    .get('/list', function(req, res) {
        let db = new Db('database', {});
        let pkmCollection = db.collection(process.env.DATABASE_NAME || 'pkmdb');
        pkmCollection.find().toArray((err, items)=>{
            res.render('list.html', {'list': items})
            db.close()
        });
    })

    .get('/autocomplete', function(req, res){
        res.setHeader('Content-Type', 'application/json');
        res.send(helpers.autocompletion(require('./pokename'), req.query.query));
    })

    .get('/delete/:id', function(req, res){
        let db = new Db('database', {});
        let pkmCollection = db.collection(process.env.DATABASE_NAME || 'pkmdb');
        pkmCollection.findOne({'_id': req.params.id}, function(err, result){
            if(err){
                res.status(400).send({ok:false})
            }else{
                fs.unlink(__dirname + '/static/images/'+result.pkm.img,function(err){
                    if(err){
                        console.log(`image not deleted ... an error occured ${result.pkm.img}`)
                    }else{
                        pkmCollection.remove({'_id': req.params.id}, function (err) {
                            if (err) {
                                console.log(`element id ${result._id} not deleted with success`);
                                console.log(`image ${result.pkm.img} not deleted with success`);
                                res.status(400).send({ok:false})
                            } else {
                                console.log(`element id ${result._id} deleted with success`);
                                console.log(`image ${result.pkm.img} deleted with success`);
                                res.status(200).send({ok:true})
                            }
                        })
                    }
                })
            }
        });
    })

    .get('/update/:id', function(req, res){
        let name = req.query.name;
        if(name){
            let db = new Db('database', {});
            let pkmCollection = db.collection(process.env.DATABASE_NAME || 'pkmdb');
            pkmCollection.update({_id: req.params.id}, {$set:{ 'pkm.name' : name }}, function(err){
                if(!err){
                    res.status(200).send({ok:true,pkm_name:name})
                }
            });
        }
    });



module.exports = app;
