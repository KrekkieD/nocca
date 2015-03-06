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

        var reqContext = new Nocca.config.requestContextConstructor(
            req,
            res,
            startTime,
            // duplicate the options object to prevent manipulation of the main config
            $extend({}, Nocca.config)
        );

        // Allow the request chainer to set up a promise chain
        Nocca.requestChainer({
            promise : deferred.promise,
            response: res
        });

        // Resolve the initial promise to kick off the chain
        deferred.resolve(reqContext);
    }

}

