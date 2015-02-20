'use strict';

var $extend = require('extend');

var $websocket = require('./httpInterface/websocket');
var $webserver = require('./httpInterface/webserver');

module.exports = httpInterface;
module.exports.broadcast = broadcast;

var DEFAULT_CONFIG = {
    server: {
        port: 3005,
        websocketServer: true,
        httpApi: true
    }
};


function httpInterface (config) {

    // we need the .server subset
    var serverConfig = $extend({}, DEFAULT_CONFIG.server, config.server);

    // if (config.httpApi === true) {

        var server = $webserver.createServer(serverConfig);

    // }

    if (serverConfig.websocketServer === true) {

        // start websocket server
        // TODO: this config may need to be configurable by user
        var websocketServer = $websocket.createServer({
            httpServer: server,
            // true, because unsafe and fuck it
            autoAcceptConnections: true
        });

        //on connect, share current state
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