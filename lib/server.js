'use strict';

var $q = require('q');
var $http = require('http');

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

        Nocca.logDebug('\n\n|  Request: ' + req.url);

        var reqContext = Nocca.requestContextFactory.createInstance(req, res);

        // kick it!
        reqContext.start();

    }

}

