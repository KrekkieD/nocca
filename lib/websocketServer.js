'use strict';

var $ws = require('websocket');
var $http = require('http');

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

        // correct httpApi re-use settings if httpApi is disabled
        if (Nocca.config.servers.websocketServer.useHttpApiServer === true &&
            typeof Nocca.httpApi === 'undefined') {

            // restore the flag
            Nocca.config.servers.websocketServer.useHttpApiServer = false;

            // and grab the opportunity to bitch about it
            Nocca.logWarning('Cannot re-use httpApiServer for websocketServer because httpApi is disabled! D\'oh!');
        }


        if (Nocca.config.servers.websocketServer.useHttpApiServer === true) {
            Nocca.config.servers.websocketServer.httpServer = Nocca.httpApi.server;
        }
        else {
            // not reusing httpApi server, so create a new server
            var onTheFlyServer = $http.createServer();
            onTheFlyServer.listen(Nocca.config.servers.websocketServer.port, function () {
                Nocca.logSuccess('Port:', Nocca.config.servers.websocketServer.port, '-- WebsocketServer (on-the-fly style)');
            });

            // add the server to the websocket config
            Nocca.config.servers.websocketServer.httpServer = onTheFlyServer;
        }

    }

    function createServer () {

        var websocketServer = new $ws.server(Nocca.config.servers.websocketServer);

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