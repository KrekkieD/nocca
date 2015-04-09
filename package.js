'use strict';

var $q = require('q');
var $npm = require('npm');

var $spawn = require('child_process').spawn;

function checkCommand (config) {

    var deferred = $q.defer();

    var versionType = process.argv[2] || undefined;

    if (typeof versionType === 'undefined' ||
        ['major', 'minor', 'patch'].indexOf(versionType) === -1) {

        deferred.reject('Unspecified or invalid version type: ' + versionType);

    }
    else {
        config.versionType = versionType;
        deferred.resolve(config);
    }

    return deferred.promise;

}

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

function checkGitStatus (config) {

    var deferred = $q.defer();

    var gitStatus = $spawn('git', ['status']);

    gitStatus.stdout.on('data', function (data) {

        data = data.toString().replace(/\s+/, '');

        if (data.indexOf('working directory clean') === -1) {
            deferred.reject('Cannot create a package when the working directory is not clean');
        }
        else {
            deferred.resolve(config);
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

    var gitStatus = $spawn('git', ['log', 'HEAD..origin/' + config.primaryBranch, '--oneline']);

    gitStatus.stdout.on('data', function (data) {

        data = data.toString().replace(/\s+/, '');

        if (data !== '') {
            deferred.reject('Working directory is not in sync with remote');
        }
        else {
            deferred.resolve(config);
        }

    });

    return deferred.promise;

}

function bumpVersion (config) {



}

function tag (config) {



}

function publish (config) {



}

function release () {

    var config = {
        primaryBranch: 'feature/packaging'
    };

    checkCommand(config)
        .then(checkMaster)
        .then(checkGitStatus)
        .then(checkStatus)
        .fail(function (err) {
            console.error('ERR: ' + err);
        });

}

release();
//checkGitStatus();