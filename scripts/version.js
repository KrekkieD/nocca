'use strict';

var $q = require('q');
var $colors = require('colors');

var $spawn = require('child_process').spawn;

var config = {
    // branch that should be tagged on
    primaryBranch: 'develop'
};

checkPrimaryBranch(config)
    .then(fetchRemote)
    .then(checkRemoteStatus)
    .catch(function (err) {

        console.log($colors.red(err));
        process.exit(1);

    });


function checkPrimaryBranch (config) {

    var deferred = $q.defer();

    var cmd = $spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD']);

    cmd.stdout.on('data', function (data) {

        data = data.toString().replace(/\s+/, '');

        if (data !== config.primaryBranch) {
            deferred.reject([
                'Cannot create a package when the current branch is not',
                config.primaryBranch + ',',
                'you are on:',
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

    cmd.on('close', function () {

        if (dataReceived === false) {
            deferred.resolve(config);
        }

    });

    return deferred.promise;

}
