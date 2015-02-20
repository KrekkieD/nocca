'use strict';

var $crypto = require('crypto');

module.exports = {};
module.exports.statisticsExporter = statisticsExporter;
module.exports.statisticsProcessor = statisticsProcessor;

// todo: log stats properly :)
var stats = {
    responses: {},
    recorded: [],
    forwarded: [],
    replayed: []
};

function statisticsProcessor (reqContext) {

    // log hash for easier visualisation of uniqueness
    var sha1 = $crypto.createHash('sha1');
    var requestKeyHash = sha1.update(reqContext.requestKey).digest('base64');


    var flagString = '';
    flagString += reqContext.flagRecorded ? '1' : '0';
    flagString += reqContext.flagForwarded ? '1' : '0';
    flagString += reqContext.flagReplayed ? '1' : '0';

    // string is:
    // rec|fwd|rep
    switch (flagString) {
        case '110':
            // recorded and forwarded
            stats.recorded.push(requestKeyHash);
            stats.responses[requestKeyHash] = reqContext.proxiedResponse;

            break;
        case '010':
            // forwarded, not recorded
            stats.forwarded.push(requestKeyHash);
            stats.responses[requestKeyHash] = reqContext.proxiedResponse;
        break;
        case '001':
            // replayed
            stats.replayed.push(requestKeyHash);
            stats.responses[requestKeyHash] = reqContext.playbackResponse;

            break;
    }

    return reqContext;
    
}

function statisticsExporter () {
    
    // export stats!
    return stats;

}
