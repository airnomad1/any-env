/*
 * npm-config
 * Copyright(c) 2017 Darshana Peiris <airnomad1@gmail.com>
 * MIT Licensed
 */

'use strict';

/* Dependencies */

const fs = require('fs');
const path = require('path');

function loadConfigs(confFile) {
    var encoding = 'utf8';
    var confFile = path.join(process.cwd(), confFile || '.env');

    if (fs.existsSync(confFile)) {
        readConfFile(confFile, encoding, function (readRes) {
            if (readRes.status == 200) {
                processConf(readRes.data);
            } else {
                console.log(readRes.error);
            }
        });
    } else {
        console.log('No .env file found');
    }
}

/**
 * Read .env file
 * @param filePath
 * **/

function readConfFile(filePath, encoding, callback) {
    var readStream = fs.readFileSync(filePath, encoding);

    var aConfs = [];

    var aLines = readStream.split(/(?:\n|\r\n|\r)/g);

    aLines.forEach(function (line) {
        if (line) {
            aConfs.push(line);
        }
    });

    callback({status: 200, data: aConfs});
}

/**
 * Process conf strings extracted from conf file (.env || env.json)
 * @param conf
 * **/

function processConf(aConfs) {

    var oConfs = {};

    aConfs.forEach(function (conf) {
        var aSplit = conf.split(/=(.+)/);

        aSplit = aSplit.filter(Boolean);

        if (aSplit.length > 1) {
            process.env[aSplit[0]] = aSplit[1];
        }
    });

    return oConfs;
}

module.exports.config = loadConfigs;