'use strict';

var $http = require('http');

var $extend = require('extend');
var $connect = require('connect');
var $q = require('q');


module.exports = server;
module.exports.request = request;
module.exports.addCaches = addCaches;

function server (cb) {

    var app = $connect();

    app.use(function (req, res) {

        var buffer = [];
        req.on('data', function (chunk) {
            buffer.push(chunk);
        });

        req.on('end', function () {

            var body = Buffer.concat(buffer).toString();

            // attempt a JSON parse on the body
            try {
                body = JSON.parse(body);
            }
            catch (e) {}

            res.end(JSON.stringify(_defaultResponseObject({
                url: req.url,
                method: req.method,
                headers: req.headers,
                body: body
            }), null, 4));

        });

    });

    return app.listen(8888, function () {

        if (typeof cb !== 'undefined') {
            cb();
        }

    });

}

function _defaultResponseObject (additional) {

    additional = additional || {};

    var responseObject = {
        timestamp: new Date().getTime()
    };

    return $extend(responseObject, additional);

}

function request (config, body) {

    var deferred = $q.defer();

    if (typeof config === 'string') {
        config = {
            path: config
        };
    }

    var req = $http.request($extend({
        host: 'localhost',
        port: '8989',
        method: 'POST'
    }, config));

    req.on('response', function (res) {

        var buffer = [];

        res.on('data', function (chunk) {
            buffer.push(chunk);
        });

        res.on('end', function () {

            res.body = Buffer.concat(buffer).toString();

            deferred.resolve(res);

        });

    });

    req.end(body);

    return deferred.promise;

}

function addCaches (caches) {

    var deferred = $q.defer();

    var fillCacheReq = $http.request({
        host: 'localhost',
        port: '8989',
        method: 'PUT',
        path: '/http-api/plugins/cacheQueue/caches'
    }, function (response) {

        response.on('end', function () {

            deferred.resolve(response);

        });

        response.resume();

    });

    fillCacheReq.end(caches);

    return deferred.promise;

}
