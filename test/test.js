const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const async = require('async');

var envFiles = [
    {file: path.resolve('./', '.env'), content: 'NAME=ANY-ENV\nVERSION=1.0.0'},
    {file: path.resolve('./', 'env.json'), content: JSON.stringify('{"NAME": "ANY-ENV", "VERSION": "1.0.0"}')},
    {file: path.resolve('./', 'custom'), content: 'NAME=ANY-ENV\nVERSION=1.0.0'}
];

function createEnvFiles(aFiles, callback) {
    var encoding = 'utf8';

    async.each(aFiles, function (oFile, eachCallback) {
        fs.writeFile(oFile.file, oFile.content, {encoding: encoding}, function (error) {
            error ? eachCallback(error) : eachCallback();
        });
    }, function (error) {
        if (error) {
            throw error
        } else {
            callback();
        }
    });
}

function deleteEnvFiles(files, callback) {
    if (files instanceof Array) {
        async.each(files, function (oFile, eachCallback) {
            fs.unlink(oFile.file, function (error) {
                error ? eachCallback(error) : eachCallback();
            });
        }, function (error) {
            if (error) {
                throw error;
            } else {
                callback();
            }
        });
    } else {
        fs.unlink(files.file, function (error) {
            if (error) {
                throw error;
            } else {
                callback();
            }
        });
    }
}

describe('env("NAME")', function () {
    before(function (done) {
        createEnvFiles(envFiles, function () {
            done();
        });
    });

    it('should return NAME in .env file', function () {
        require('../index').config();
        expect(env('NAME')).to.equal('ANY-ENV')
    });
});


describe('env("NAME") with env.json & custom file', function () {
    before(function (done) {
        deleteEnvFiles(envFiles[0], function () {
            envFiles.splice(0, 1);
            done();
        });
    });

    it('should return NAME in env.json file', function () {
        require('../index').config();
        expect(env('NAME')).to.equal('ANY-ENV');
    });

    it('should return NAME in custom file', function () {
        require('../index').config(envFiles[1].file);
        expect(env('NAME')).to.equal('ANY-ENV');
    });

    after(function (done) {
        deleteEnvFiles(envFiles, function () {
            done();
        });
    });
});

describe('env("NAME") with out any configuration file', function () {
    it('should return undefined because no file is there', function () {
        require('../index').config();
        expect(env('NAME')).to.equal(undefined);
    });
});


