/*
 * npm-config
 * Copyright(c) 2017 Darshana Peiris <airnomad1@gmail.com>
 * MIT Licensed
 */

'use strict';

/* Dependencies */

const fs = require('fs');
const path = require('path');
const debug = require('debug');

var appConfs = {};

function loadConfigs(confFile) {
    var encoding = 'utf8';
    var file = decideConfFile(confFile);

    if (file.type == 'env') {
        readConfFile(file, encoding, function (readRes) {
            if (readRes.status == 200) {
                appConfs = processConf(readRes.data);
            } else {
                debug.log(readRes.error);
            }
        });
    } else if (file.type == 'json') {
        readConfFile(file, encoding, function (readRes) {
            if (readRes.status == 200) {
                appConfs = readRes.data;
            } else {
                debug.log(readRes.error);
            }
        });
    } else {
        debug.log('No .env file found');
    }
}

/**
 * Decide which conf file to use
 * @param file - file path
 * **/
function decideConfFile(file) {
    // TODO : add support for *.js files
    var filePath = path.join(process.cwd(), file || '.env');

    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), 'env.json');
        return fs.existsSync(filePath) ? {file: filePath, type: 'json'} : false;
    } else {
        return {file: filePath, type: 'env'};
    }
}

/**
 * Read .env file
 * @param filePath
 * **/

function readConfFile(oEnvFile, encoding, callback) {
    if (oEnvFile.type == 'env') {
        try {
            var readStream = fs.readFileSync(oEnvFile.file, encoding);

            var aConfs = [];

            var aLines = readStream.split(/(?:\n|\r\n|\r)/g);

            aLines.forEach(function (line) {
                if (line) {
                    aConfs.push(line);
                }
            });

            callback({status: 200, data: aConfs});
        } catch (e) {
            callback({status: 400, error: e});
        }
    } else {
        try {
            var oConfs = JSON.parse(fs.readFileSync(oEnvFile.file, encoding));
            callback({status: 200, data: oConfs});
        } catch (e) {
            callback({status: 400, error: e});
        }
    }
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
            var key = aSplit[0].replace(' ', '_');
            oConfs[key] = aSplit[1];
        }
    });

    return oConfs;
}

global.env = function (key) {
    return appConfs[key];
};

module.exports.config = loadConfigs;