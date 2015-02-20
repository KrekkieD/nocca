'use strict';

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

    var flagString = '';
    flagString += reqContext.flagRecorded ? '1' : '0';
    flagString += reqContext.flagFowarded ? '1' : '0';
    flagString += reqContext.flagReplayed ? '1' : '0';

    // string is:
    // rec|fwd|rep
    switch (flagString) {
        case '110':
            // recorded and forwarded
            stats.recorded.push(reqContext.requestKey);
            stats.responses[reqContext.requestKey] = reqContext.proxiedResponse;

            break;
        case '010':
            // forwarded, not recorded
            stats.forwarded.push(reqContext.requestKey);
            stats.responses[reqContext.requestKey] = reqContext.proxiedResponse;
        break;
        case '001':
            // replayed
            stats.replayed.push(reqContext.requestKey);
            stats.responses[reqContext.requestKey] = reqContext.playbackResponse;

            break;
    }

    return reqContext;
    
}

function statisticsExporter () {
    
    // export stats!
    return stats;

}
