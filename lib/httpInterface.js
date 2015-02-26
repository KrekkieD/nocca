'use strict';

// these are private modules so direct inclusion is ok
var $websocket = require(__dirname + '/httpInterface/websocket');
var $webserver = require(__dirname + '/httpInterface/webserver');

module.exports = httpInterface;
module.exports.broadcast = broadcast;

// TODO: Properly allow configuration
function httpInterface (config) {

    // if (config.httpApi === true) {

        var server = $webserver.createServer(config);

    // }

    if (config.server.websocketServer === true) {

        // start websocket server
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