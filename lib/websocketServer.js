'use strict';

var $ws = require('ws');

module.exports = WebsocketServer;

function WebsocketServer (Nocca, server) {

    var self = this;

    self.broadcast = broadcast;
    self.sendToConnection = sendToConnection;

    self.websocketServer = new $ws.Server({
        server: server
    });

    // subscribe to statsChanged event
    Nocca.pubsub.subscribe(
        Nocca.constants.PUBSUB_STATS_UPDATED,
        broadcast
    );

    self.websocketServer.on('connection', function (webSocketConnection) {

        // TODO: this is kind of a hardwired call to statsLogger, forcing an API.
        sendToConnection(
            webSocketConnection,
            Nocca.statsLogger.dump()
        );

    });


    function sendToConnection (connection, data) {

        data = _sanitizeData(data);
        connection.send(data);

    }

    function broadcast (data) {

        if (typeof self.websocketServer === 'undefined') {
            return false;
        }

        data = _sanitizeData(data);

        self.websocketServer.clients.forEach(function (client) {
            client.send(data);
        });

    }

}

function _sanitizeData (data) {

    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }

    return data;

}
