'use strict';

var $http = require('http');

var $extend = require('extend');
var $q = require('q');

module.exports = {
    defaultCall: defaultCall,
    lottaBogi: lottaBogi
};

function defaultCall (requestConfig) {

    var deferred = $q.defer();

    var DEFAULT_REQUEST = {
        hostname: 'localhost',
        port: 8989,
        method: 'GET',
        path: '/proxy/bogi/ding'
    };

    requestConfig = $extend({}, DEFAULT_REQUEST, requestConfig);

    console.log(requestConfig);

    var req = $http.request(requestConfig, function (res) {

        deferred.resolve();
        res.resume();

    });

    req.end(requestConfig.body || undefined);

    return deferred.promise;

}

function lottaBogi (lotta) {

    if (lotta > 0) {

        var lottaLeft = lotta - 1;

        defaultCall({
            path: '/proxy/bogi/ding/' + lotta
        }).then(function () {

            console.log('hit!', lottaLeft + ' remaining');

            if (lottaLeft > 0) {
                lottaBogi(lottaLeft);
            }

        });

    }

}