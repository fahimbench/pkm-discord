const request = require('request');
const fs = require('fs');

function download(uri, filename){
    request.head(uri, function(){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', () => {});
    });
}

function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}

function findPkmById(id, data) {
    return data.find(item => item.id === id);
}

function makeid(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
    let charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function autocompletion(data, query){
        return data.filter(function(obj){
            let original = obj.original.toLowerCase();
            return original.includes(query.toLowerCase());
        })
}

module.exports = {download, getRandomInt, findPkmById, makeid, autocompletion};