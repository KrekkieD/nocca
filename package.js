'use strict';

var $q = require('q');
var $npm = require('npm');

var $spawn = require('child_process').spawn;


function checkMaster (config) {

    var deferred = $q.defer();

    var gitBranch = $spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD']);

    gitBranch.stdout.on('data', function (data) {

        data = data.toString().replace(/\s+/, '');

        if (data !== config.primaryBranch) {
            deferred.reject([
                'Cannot create a package when the current branch is not ',
                config.primaryBranch,
                ', you are on: ',
                data
                ].join(' ')
            );
        }
        else {
            deferred.resolve(config);
        }

    });

    return deferred.promise;

}

function checkGitStatus () {

    var deferred = $q.defer();

    var gitStatus = $spawn('git', ['status']);

    gitStatus.stdout.on('data', function (data) {

        data = data.toString().replace(/\s+/, '');

        if (data.indexOf('working directory clean') === -1) {
            deferred.reject('Cannot create a package when the working directory is not clean');
        }
        else {
            deferred.resolve();
        }

    });

    return deferred.promise;

}

function updateRemoteRefs (config) {

    var deferred = $q.defer();

    var updateRemotes = $spawn('git', ['remote', 'update']);

    updateRemotes.stdout.on('data', function (data) {
        console.log(data.toString());
        deferred.resolve(config);
    });

    return deferred.promise;

}

function checkStatus (config) {

    var deferred = $q.defer();

    var gitStatus = $spawn('git', ['status', '-uno']);

    gitStatus.stdout.on('data', function (data) {

        data = data.toString().replace(/\s+/, '');

        console.log(data);
        if (data.indexOf('Already up-to-date') === -1) {
            deferred.reject('Working directory was not up to date');
        }
        else {
            deferred.resolve(config);
        }

    });

    return deferred.promise;

}

function release () {

    var config = {
        primaryBranch: 'feature/packaging'
    };

    checkMaster(config)
        //.then(checkGitStatus)
        .then(updateRemoteRefs)
        .then(checkStatus)
        .fail(function (err) {
            console.error('ERR: ' + err);
        });

}

release();
//checkGitStatus();