'use strict';

var $q = require('q');
var $http = require('http');
var $connect = require('connect');

module.exports = Server;

/**
 * The Server opens the port that accepts requests and kicks of the match/forward/replay-cycle. This is the heart
 * of Nocca.
 *  
 * @param Nocca the Nocca instance whose configuration should be used setting up the server.
 * @constructor creates a new Server instance using the configuration from the supplied Nocca object.
 */
function Server (Nocca) {

	var self = this;
    /**
     * Opens the configured port and starts listening for incoming request. It requires the Nocca object
     * to have a service called 'requestChainer', which it will feed a request context. The request context
     * is an object containing the HTTP response object and the promise that resolves when the entire request
     * has been read.
     *  
     * @type {http.Server|*}
     */
	self.server = $connect();

	self.server.use(connectionHandler);

	Nocca.getConfig('servers.proxy.listen', Nocca.config, true)
		.then(function (config) {
			self.server.listen(config.port, function () {
				Nocca.logSuccess('Port:', config.port, '-- Proxy server');
			});
		});

    function connectionHandler(req, res) {

        Nocca.logDebug('Request: ' + req.url);

        var reqContext = Nocca.requestContextFactory.createInstance(req, res);

        // kick it!
        reqContext.start();

    }

}

