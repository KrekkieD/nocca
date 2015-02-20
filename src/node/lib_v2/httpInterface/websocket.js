'use strict';

var $ws = require('websocket');

module.exports = {};
module.exports.createServer = createServer;
module.exports.broadcast = broadcast;
module.exports.sendToConnection = sendToConnection;


var websocketServer;

function createServer (config) {

    websocketServer = new $ws.server(config);
    return websocketServer;

}

function _sanitizeData (data) {

    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }

    return data;

}

function sendToConnection (connection, data) {

    data = _sanitizeData(data);
    connection.send(data);

}

function broadcast (data) {

    if (typeof websocketServer === 'undefined') {
        // TODO: handle properly?
        return false;
    }

    data = _sanitizeData(data);
    websocketServer.broadcast(data);

}