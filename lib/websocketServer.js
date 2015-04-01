'use strict';

var $ws = require('websocket');
var $connect = require('connect');
var $http = require('http');

module.exports = WebsocketServer;

function WebsocketServer (Nocca) {

    var self = this;

    // create server on instantiation
    self.server = createServer();
    self.websocketServer = undefined; // = createWebsocketServer();

    self.broadcast = broadcast;
    self.sendToConnection = sendToConnection;

	Nocca.pubsub.subscribe(Nocca.constants.PUBSUB_NOCCA_INITIALIZE_PLUGIN, function () {
		self.websocketServer = createWebsocketServer();
	});

	function createServer () {

		// make sure config makes sense
		_cleanConfig();

		if (Nocca.config.servers.websocketServer.useWrapperServer === true) {
			return Nocca.wrapperServer.server;
		}
		else if (Nocca.config.servers.websocketServer.useHttpApiServer === true) {
			return Nocca.httpApi.server;
		}
		else {
			// not reusing httpApi server, so create a new server
			return _createOnTheFlyServer();
		}

	}

    function createWebsocketServer () {

		// assign own server as server to use for sockets
		Nocca.config.servers.websocketServer.options.httpServer = self.server;

		var websocketServer = new $ws.server(Nocca.config.servers.websocketServer.options);

        websocketServer.on('connect', function (webSocketConnection) {

            // TODO: this is kind of a hardwired call to statsLogger, forcing an API.
            sendToConnection(
                webSocketConnection,
                Nocca.statsLogger.dump()
            );

        });

        // subscribe to statsChanged event
        Nocca.pubsub.subscribe(
            Nocca.constants.PUBSUB_STATS_UPDATED,
            broadcast
        );

		return websocketServer;

    }

    function sendToConnection (connection, data) {

        data = _sanitizeData(data);
        connection.send(data);

    }

    function broadcast (data) {

        if (typeof self.websocketServer === 'undefined') {
            return false;
        }

        data = _sanitizeData(data);
        self.websocketServer.broadcast(data);

    }

	/**
	 * This doesn't actually return anything but just cleans Nocca config settings
	 */
	function _cleanConfig () {

		// shortcut for the config
		var serverConfig = Nocca.config.servers;

		// correct httpApi re-use settings if httpApi is disabled
		if (serverConfig.websocketServer.useHttpApiServer === true &&
			serverConfig.httpApi.enabled !== true) {

			// restore the flag
			serverConfig.websocketServer.useHttpApiServer = false;

			// and grab the opportunity to bitch about it
			Nocca.logWarning('Cannot re-use httpApiServer for websocketServer because httpApi is not enabled! D\'oh!');
		}

		// correct wrapperServer re-use settings if wrapperServer is disabled
		if (serverConfig.websocketServer.useWrapperServer === true &&
			serverConfig.wrapperServer.enabled !== true) {

			// restore the flag
			serverConfig.websocketServer.useWrapperServer = false;

			// and grab the opportunity to bitch about it
			Nocca.logWarning('Cannot re-use httpApiServer for websocketServer because httpApi is not enabled! D\'oh!');
		}

		// cannot reuse both httpApi and wrapperServer, prefer wrapper
		if (serverConfig.websocketServer.useHttpApiServer &&
			serverConfig.websocketServer.useWrapperServer) {

			serverConfig.websocketServer.useHttpApiServer = false;

		}

	}

	function _createOnTheFlyServer () {

		var onTheFlyServer = $connect();

		Nocca.getConfig('servers.websocketServer.listen', Nocca.config, true)
			.then(function (config) {

				var args = [];

				config.port && args.push(config.port);
				config.hostname && args.push(config.hostname);

				args.push(function () {
					args.pop();
					Nocca.logSuccess(args.join(', '), '-- WEBSOCKET SERVER (ON THE FLY)');
				});

				onTheFlyServer.listen.apply(self.server, args);

			});

		return onTheFlyServer;

	}

}

function _sanitizeData (data) {

    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }

    return data;

}