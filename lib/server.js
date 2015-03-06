'use strict';

var $q = require('q');
var $http = require('http');
var $extend = require('extend');
var $utils = require('./utils');

module.exports = Server;

/**
 * The Server opens the port that accepts requests and kicks of the match/forward/replay-cycle. This is the heart
 * of Nocca.
 *  
 * @param Nocca the Nocca instance whose configuration should be used setting up the server.
 * @constructor creates a new Server instance using the configuration from the supplied Nocca object.
 */
function Server (Nocca) {

    /**
     * Opens the configured port and starts listening for incoming request. It requires the Nocca object
     * to have a service called 'requestChainer', which it will feed a request context. The request context
     * is an object containing the HTTP response object and the promise that resolves when the entire request
     * has been read.
     *  
     * @type {http.Server|*}
     */
    this.server = $http.createServer(connectionHandler)
        .listen(Nocca.config.servers.proxy.port, function () {
            Nocca.logSuccess('Port:', Nocca.config.servers.proxy.port, '-- Proxy server');
        });

    function connectionHandler(req, res) {

        Nocca.logDebug('|  Request: ' + req.url);

        var promise = flattenIncomingRequest(req)
            .then(function(flatReq) {

                var context = {
                    requestStartTime: new Date().getTime(),
                    httpResponse: res,
                    request: flatReq,
                    // duplicate the options object to prevent manipulation of the main config
                    opts: $extend({}, Nocca.config)
                };

                return context;

            });

        Nocca.requestChainer({
            promise : promise,
            response: res
        });
    }

}

/**
 * Stores properties from the incoming request and attempts to read the body sent along with the
 * request. All this is then stuffed in one object and fed into the promise.
 *
 * @param req the request to flatten into an object
 * @returns {*|Document.promise|k.promise|{then, catch, finally}|promise}
 */
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
