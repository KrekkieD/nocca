'use strict';

var $websocket = require('./httpInterface/websocket');
var $webserver = require('./httpInterface/webserver');

module.exports = httpInterface;
module.exports.broadcast = broadcast;

function httpInterface (config) {

    // if (config.httpApi === true) {

        var server = $webserver.createServer(config);

    // }

    if (config.server.websocketServer === true) {

        // start websocket server
        // TODO: this config may need to be configurable by user
        var websocketServer = $websocket.createServer({
            httpServer: server,
            // true, because unsafe and fuck it
            autoAcceptConnections: true
        });

        // on connect, share current state
        websocketServer.on('connect', function (webSocketConnection) {

            $websocket.sendToConnection(
                webSocketConnection,
                config.statistics.exporter()
            );

        });

    }

}

function broadcast (data) {

    $websocket.broadcast(data);

}