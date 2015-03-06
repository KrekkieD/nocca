'use strict';

var $q = require('q');
var $http = require('http');
var $extend = require('extend');
var $utils = require('./utils');

module.exports = Server;

function Server (Nocca) {


    this.server = $http.createServer(connectionHandler)
        .listen(Nocca.config.servers.proxy.port, function () {
            Nocca.logSuccess('Port:', Nocca.config.servers.proxy.port, '-- Proxy server');
        });

    function connectionHandler(req, res) {

        var deferred = $q.defer();

        var startTime = new Date().getTime();
        Nocca.logDebug('\n\n|  Request: ' + req.url);

        res.on('finish', function () {
            var endTime = new Date().getTime();
            Nocca.logDebug('|  Request ended');
            Nocca.logDebug(startTime + ' | Start Timestamp');
            Nocca.logDebug(endTime + ' | End Timestamp');
            Nocca.logDebug(endTime - startTime + ' | Duration');

        });

        flattenIncomingRequest(req)
            .then(function(flatReq) {

                var context = {
                    requestStartTime: startTime,
                    httpResponse: res,
                    request: flatReq,
                    // duplicate the options object to prevent manipulation of the main config
                    opts: $extend({}, Nocca.config)
                };

                deferred.resolve(context);

            });

        Nocca.requestChainer({
            promise : deferred.promise,
            response: res
        });
    }

}

function flattenIncomingRequest (req) {

    var deferred = $q.defer();

    var flatReq = {
        url: req.url,
        method: req.method,
        path: req.path,
        headers: req.headers
    };

    $utils.readBody(req).then(function(body) {
        flatReq.body = body || '';

        deferred.resolve(flatReq);
    }).fail(function(err) {
        
        flatReq.statusCode = 502;
        flatReq.message = err.message;
        flatReq.err = err;
        
        deferred.reject(flatReq);
        
    });


    return deferred.promise;

}
