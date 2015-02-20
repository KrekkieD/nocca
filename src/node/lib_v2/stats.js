'use strict';

module.exports = {};
module.exports.defaultStatisticsReporter  = webSocketReporter;
module.exports.defaultStatisticsProcessor = processRequestContextStatistics;
module.exports.webSocketReporter          = webSocketReporter;
module.exports.processContext             = processRequestContextStatistics;

var $httpInterface = require('./httpInterface');

// todo: make properly :)
var stats = [];

function processRequestContextStatistics (reqContext) {
    
    // TODO: Process stats!
    stats.push(reqContext.proxiedResponse);
    
}

function webSocketReporter () {
    
    // Report stats!
    $httpInterface.broadcast(JSON.stringify(stats));

}
