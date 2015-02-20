'use strict';

module.exports = {};
module.exports.statisticsExporter = statisticsExporter;
module.exports.statisticsProcessor = statisticsProcessor;

// todo: log stats properly :)
var stats = [];

function statisticsProcessor (reqContext) {
    
    // TODO: Process stats!
    stats.push(reqContext.proxiedResponse);
    
}

function statisticsExporter () {
    
    // export stats!
    return stats;

}
