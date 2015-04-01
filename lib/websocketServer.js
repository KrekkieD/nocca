'use strict';

var $ws = require('websocket');
var $connect = require('connect');

module.exports = WebsocketServer;

function WebsocketServer (Nocca) {

    var self = this;

    // create server on instantiation
    self.server = createServer(cleanConfig());

    self.broadcast = broadcast;
    self.sendToConnection = sendToConnection;


    /**
     * This doesn't actually return anything but just cleans Nocca config settings
     */
    function cleanConfig () {

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


        if (serverConfig.websocketServer.useHttpApiServer === true) {
            serverConfig.websocketServer.options.httpServer = Nocca.httpApi.server;
        }
        else {
            // not reusing httpApi server, so create a new server
            // and add the server to the websocket config
            serverConfig.websocketServer.options.httpServer = createOnTheFlyServer();
        }

    }

	function createOnTheFlyServer () {

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

    function createServer () {

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

        if (typeof self.server === 'undefined') {
            return false;
        }

        data = _sanitizeData(data);
        self.server.broadcast(data);

    }

}

function _sanitizeData (data) {

    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }

    return data;

}