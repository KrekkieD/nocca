'use strict';

module.exports = {};
module.exports.newEndpoint = addCacheEndpoint;
module.exports.select = selectCacheEndpoint;

var $ws = require('nodejs-websocket');

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
    console.log('joehoe');
    if (caches.hasOwnProperty(cacheName)) {
        caches[cacheName].statistics.requests++;
        publishStatistics();
        return caches[cacheName];
    }
    else {
        return undefined;
    }
}

var server = $ws.createServer(function(conn) {
    
    publishStatistics(conn);
    
}).listen(3005);

function publishStatistics(singleConn) {
    
    var statisticsView = {};
    
    for (var cacheName in Object.keys(caches)) {
        statisticsView[cacheName] = cacheName[cacheName].statistics;
    }
    
    var statisticsPayload = JSON.stringify(statisticsView);
    
    if (singleConn) {
        singleConn.sendText(statisticsPayload);
        
    }
    else {
        server.connections.forEach(function(conn) {

            conn.sendText(statisticsPayload);

        });
    }

}