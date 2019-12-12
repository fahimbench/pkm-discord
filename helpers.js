const request = require('request');
const fs = require('fs');

function download(uri, filename){
    request.head(uri, function(){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', () => {});
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function findPkmById(id, data) {
    return data.find(item => item.id === id);
}

module.exports = {download, getRandomInt, findPkmById};