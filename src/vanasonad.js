const fs = require("fs");

function getOneWisdom(fileRef){
    return new Promise((resolve, reject) => {
        fs.readFile(fileRef, "utf8", (err, data) => {
            if(err){
                reject(err);
            } else {
                let oldWisdomList = data
                    .split(";")

                let randomIndex = Math.floor(Math.random() * oldWisdomList.length);
                resolve(oldWisdomList[randomIndex]);
            }
        });
    });
}

module.exports = {getOneWisdom};