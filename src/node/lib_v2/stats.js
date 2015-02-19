'use strict';

module.exports = {};
module.exports.defaultStatisticsReporter  = webSocketReporter;
module.exports.defaultStatisticsProcessor = processRequestContextStatistics;
module.exports.webSocketReporter          = webSocketReporter;
module.exports.init                       = initializeWebSocket;
module.exports.processContext             = processRequestContextStatistics;

var $ws = require('ws').Server;

function processRequestContextStatistics(reqContext) {
    
    // TODO: Extract stats!
    
}

function webSocketReporter() {
    
    // TODO: Report stats!
    
}


function initializeWebSocket(port) {
    
    // TODO: Init awesome websockety!
    var wss = new $ws({port: port});
    wss.on('connection', function(ws) {
        
        ws.send('test');
        
    })
    
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