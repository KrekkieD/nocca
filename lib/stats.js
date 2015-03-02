'use strict';

var $constants = require('./constants');

var $crypto = require('crypto');

module.exports = StatsRecorder;

function StatsRecorder (Nocca) {

    // select log type
    switch (Nocca.config.statistics.mode) {
        case Nocca.constants.STATISTICS_LOG_MODE_OFF:
            // empty function
            this.log = function () {};
            break;
        case Nocca.constants.STATISTICS_LOG_MODE_LAZY:
            // TODO: to implement. Keep record of all incoming reqContexts and process on demand (httpApi? add func to this API?)
            this.log = function () {};
            break;
        case Nocca.constants.STATISTICS_LOG_MODE_REALTIME:
            this.log = log;
            break;

    }
    this.dump = dump;

    var stats = {
        responses: {},
        recorded: [],
        forwarded: [],
        replayed: [],
        endpoints: {}
    };

    function log (reqContext) {

        // log hash for easier visualisation of uniqueness
        var sha1 = $crypto.createHash('sha1');
        var requestKeyHash = sha1.update(reqContext.requestKey).digest('base64');

        // only log the response once to prevent overwrites
        if (typeof stats.responses[requestKeyHash] === 'undefined') {

            stats.responses[requestKeyHash] = {
                hash: requestKeyHash,
                request: reqContext.request,
                proxiedRequest: reqContext.proxiedFlatRequest || null,
                response: reqContext.response,
                endpoint: reqContext.endpoint
            };

        }

        stats.endpoints[reqContext.endpoint.key] = stats.endpoints[reqContext.endpoint.key] || [];
        stats.endpoints[reqContext.endpoint.key].push(requestKeyHash);

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

                break;
            case '010':
                // forwarded, not recorded
                stats.forwarded.push(requestKeyHash);
                break;
            case '001':
                // replayed
                stats.replayed.push(requestKeyHash);

                break;
        }

        // publish
        Nocca.pubsub.publish(
            $constants.PUBSUB_STATS_UPDATED,
            [ dump() ]
        );

        return reqContext;

    }

    function dump () {

        // export stats!
        return stats;

    }

}

