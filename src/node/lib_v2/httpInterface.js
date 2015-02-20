'use strict';

var $extend = require('extend');

var $websocket = require('./httpInterface/websocket');
var $webserver = require('./httpInterface/webserver');

module.exports = httpInterface;
module.exports.broadcast = broadcast;

var DEFAULT_CONFIG = {
    port: 3005,
    websocketServer: true,
    httpApi: true
};


function httpInterface (config) {

    config = $extend({}, DEFAULT_CONFIG, config);

    // if (config.httpApi === true) {

        var server = $webserver.createServer({
            port: config.port
        });

    // }

    if (config.websocketServer === true) {

        // start websocket server
        $websocket.createServer({
            httpServer: server,
            // true, because unsafe and fuck it
            autoAcceptConnections: true
        });

    }

}

function broadcast (data) {

    $websocket.broadcast(data);

}