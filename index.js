/*
 * any-env
 * Copyright(c) 2017 Darshana Peiris <airnomad1@gmail.com>
 * MIT Licensed
 */

'use strict';

/* Dependencies */

const fs = require('fs');
const path = require('path');
const debug = require('debug');
const root = require('app-root-path');

var appConfs = {};

/**
 * trigger reading conf file
 * @param {String} confFile - configuration file name
 **/
function loadConfigs(confFile) {
    appConfs = {};
    var encoding = 'utf8';

    confFile = confFile || undefined;
    var file = decideConfFile(confFile);

    if (file.type == 'env' || file.type == 'json') {
        readConfFile(file, encoding, function (readRes) {
            if (readRes.status == 200 && file.type == 'env') {
                appConfs = processConf(readRes.data);
            } else if (readRes.status == 200 && file.type == 'json') {
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

    var filePath = file || path.join(root.path, '.env');

    if (!fs.existsSync(filePath)) {
        filePath = path.join(root.path, 'env.json');
        return fs.existsSync(filePath) ? {file: filePath, type: 'json'} : false;
    } else {
        return {file: filePath, type: (path.extname(filePath) == '.json') ? 'json' : 'env'};
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
            var oConfs = JSON.parse(JSON.parse(fs.readFileSync(oEnvFile.file, encoding)));
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