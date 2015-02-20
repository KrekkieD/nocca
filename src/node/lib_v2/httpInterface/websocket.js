'use strict';

var $ws = require('websocket');
var $extend = require('extend');

module.exports = {};
module.exports.createServer = createServer;
module.exports.broadcast = broadcast;

var DEFAULT_CONFIG = {
    server: {
        port: 3005
    }
};

var websocketServer;

function createServer (config) {

    //config = $extend({}, DEFAULT_CONFIG, config);

    // TODO: merge config with defaults
    websocketServer = new $ws.server(config);

}

function broadcast (data) {

    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }

    websocketServer.broadcast(data);

}