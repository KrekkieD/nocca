'use strict';

module.exports = {};
module.exports.newEndpoint = addCacheEndpoint;
module.exports.selector = selectCacheEndpoint;


var $q = require('q');
var $ws = require('ws').Server;

var endpoints = {};

function addCacheEndpoint(name, target) {
    endpoints[name] = {
        targetBaseUrl: target,
        statistics: {
            requests: 0,
            hits: 0,
            misses: 0
        }
    };

    publishStatistics();

}

function selectCacheEndpoint(reqContext) {
    var d = $q.defer();
    
        var cacheName = firstUrlPart(reqContext.request.url);

        if (endpoints.hasOwnProperty(cacheName)) {
            endpoints[cacheName].statistics.requests++;

            reqContext.endpoint = {
                key: cacheName,
                remainingUrl: remainingUrlAfterCacheKey(reqContext.request.url, cacheName),
                definition: endpoints[cacheName]
            }
            publishStatistics();
            
            d.resolve(reqContext);
            console.log('|    Selected cache endpoint: ' + cacheName);
        }
        else {
            reqContext.error = 'No matching endpoint found';
            reqContext.statusCode = 404;
            
            console.log('|    No cache endpoint found: ' + cacheName);
            
            d.reject( reqContext );
        }

    return d.promise;
}

function firstUrlPart(url) {
    return (url) ? url.split('/')[1] : undefined;
}

function remainingUrlAfterCacheKey(url, cacheKey) {
    return url.substring(cacheKey.length + 2);
}


//var wss = new $ws({port: 3005});
//wss.on('connection', function (ws) {
//
//    // poll for changes
//    var lastSentState;
//    var interval = setInterval(function () {
//
//        var state = getState();
//
//        if (state !== lastSentState) {
//            lastSentState = state;
//            publishStatistics(state, ws);
//        }
//
//    }, 200);
//
//    ws.on("close", function () {
//        clearInterval(interval);
//    });
//
//});

function getState() {

    // TODO: dirty! should make lightweight func
    return 'bla';
}

function publishStatistics(state, singleConn) {

    if (!state) {
        state = getState();
    }

    if (singleConn) {

        singleConn.send(state);

    }
    else {

        //wss.clients.forEach(function each(client) {
        //    client.send(state);
        //});

    }

}