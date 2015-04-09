'use strict';

var $q = require('q');
//var $npm = require('npm');
var $semver = require('semver');

var $spawn = require('child_process').spawn;
var $exec = require('child_process').exec;

function checkCommand (config) {

    var deferred = $q.defer();

    var versionType = process.argv[2] || undefined;

    if (typeof versionType === 'undefined') {

        deferred.reject('Unspecified version or version type');

    }
    else {
        config.versionType = versionType;
        deferred.resolve(config);
    }

    return deferred.promise;

}

function checkPrimaryBranch (config) {

    var deferred = $q.defer();

    var cmd = $spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD']);

    cmd.stdout.on('data', function (data) {

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

    var cmd = $spawn('git', ['status']);

    cmd.stdout.on('data', function (data) {

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

function fetchRemote (config) {

    var deferred = $q.defer();

    var cmd = $spawn('git', ['fetch']);

    cmd.on('close', function () {
        deferred.resolve(config);
    });

    return deferred.promise;

}

function checkRemoteStatus (config) {

    var deferred = $q.defer();

    var cmd = $spawn('git', ['log', 'HEAD..origin/' + config.primaryBranch, '--oneline']);

    var dataReceived = false;

    cmd.stdout.on('data', function (data) {

        dataReceived = true;

        data = data.toString().replace(/\s+/, '');

        if (data !== '') {
            console.log(data);
            deferred.reject('Working directory is not in sync with remote');
        }
        else {
            deferred.resolve(config);
        }

    });

    cmd.on('close', function (code) {

        if (dataReceived === false) {
            deferred.resolve(config);
        }

    });

    return deferred.promise;

}

function bumpVersion (config) {

    var deferred = $q.defer();

    config.packageJson = require(__dirname + '/package.json');

    var cmd = $exec('npm version ' + config.versionType, function (err, stdout) {

        if (err) {
            console.log(err);
        }
        console.log(stdout);
        //
        //stdout.on('data', function (data) {
        //
        //    console.log('data!', data);
        //    data = data.toString().replace(/\s+/, '');
        //    var version = $semver.clean(data);
        //
        //    if ($semver.valid(version) === null) {
        //        deferred.reject(data);
        //    }
        //    else {
        //        config.version = version;
        //        deferred.resolve(config);
        //    }
        //
        //});
        //
        //cmd.stdout.on('error', function (err) {
        //    console.log(err);
        //});

    });

    return deferred.promise;

}

function publish (config) {

    console.log('Done! Version bumped to ' + config.version);
    console.log('Package is ready for publishing.');
    console.log('Don\'t forget to git push --tags');

    return true;

}

function release () {

    var config = {
        primaryBranch: 'feature/packaging'
    };

    checkCommand(config)
        .then(checkPrimaryBranch)
        //.then(checkGitStatus)
        .then(fetchRemote)
        .then(checkRemoteStatus)
        .then(bumpVersion)
        .then(publish)
        .fail(function (err) {
            console.error('ERR: ' + err);
        });

}

release();
//checkGitStatus();