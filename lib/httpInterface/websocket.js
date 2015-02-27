'use strict';

var $ws = require('websocket');

module.exports = WebsocketServer;

function WebsocketServer (Nocca) {

    var self = this;

    // create server on instantiation
    self.server = new $ws.server(Nocca.config.servers.websocketServer);

    self.broadcast = broadcast;
    self.sendToConnection = sendToConnection;

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