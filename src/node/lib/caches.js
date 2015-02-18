'use strict';

module.exports = {};
module.exports.newEndpoint = addCacheEndpoint;
module.exports.select = selectCacheEndpoint;

var $ws = require('ws').Server;

var $recorder = require('./recorder');

var caches = {};

function addCacheEndpoint(name, target) {
    caches[name] = {
        targetBaseUrl: target,
        statistics: {
            requests: 0,
            hits:     0,
            misses:   0
        }
    };

    publishStatistics();

}

function selectCacheEndpoint(cacheName) {

    if (caches.hasOwnProperty(cacheName)) {
        caches[cacheName].statistics.requests++;

        publishStatistics();
        return caches[cacheName];
    }
    else {
        return undefined;
    }
}


var wss = new $ws({port: 3005});
wss.on('connection', function (ws) {

    // poll for changes
    var lastSentState;
    var interval = setInterval(function () {

        var state = getState();

        if (state !== lastSentState) {
            lastSentState = state;
            publishStatistics(state, ws);
        }

    }, 200);

    ws.on("close", function () {
        clearInterval(interval);
    });

});

function getState () {

    // TODO: dirty! should make lightweight func
    return JSON.stringify($recorder.exportState());

}

function publishStatistics(state, singleConn) {

    if (!state) {
        state = getState();
    }

    if (singleConn) {

        singleConn.send(state);

    }
    else {

        wss.clients.forEach(function each(client) {
            client.send(state);
        });

    }

}