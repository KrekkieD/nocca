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
        miss: [],
        endpoints: {},
        storyLog: []
    };

    function log (reqContext) {

        Nocca.logDebug('Logging stats');
        //console.log(Object.keys(reqContext));

        if (typeof reqContext.requestKey === 'undefined') {
            Nocca.logDebug('On the fly key generation');
            return Nocca.config.keyGenerator(reqContext).then(log);
        }
        // log hash for easier visualisation of uniqueness
        var sha1 = $crypto.createHash('sha1');
        var requestKeyHash = sha1.update(reqContext.requestKey).digest('base64');

        // only log the response once to prevent overwrites
        if (typeof stats.responses[requestKeyHash] === 'undefined') {

            stats.responses[requestKeyHash] = {
                hash: requestKeyHash,
                requestKey: reqContext.requestKey,
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
        flagString += reqContext.flagCachemiss ? '1' : '0';

        // string is:
        // rec|fwd|rep|mis
        switch (flagString) {
            case '1100':
                // recorded and forwarded
                stats.recorded.push(requestKeyHash);

                _tell('Request on ' + reqContext.endpoint.key + ' recorded and forwarded', {rec: true, fwd: true, requestKeyHash: requestKeyHash});

                break;
            case '0100':
                // forwarded, not recorded
                stats.forwarded.push(requestKeyHash);

                _tell('Request on ' + reqContext.endpoint.key + ' forwarded', {fwd: true, requestKeyHash: requestKeyHash});

                break;
            case '0010':
                // replayed
                stats.replayed.push(requestKeyHash);

                _tell('Request on ' + reqContext.endpoint.key + ' replayed', {rpl: true, requestKeyHash: requestKeyHash});

                break;
            case '0001':

                // could not respond
                stats.miss.push(requestKeyHash);

                _tell('Request on endpoint \'' + reqContext.endpoint.key + '\' missed, no response found', {miss: true, requestKeyHash: requestKeyHash});

                break;
            default:

                stats.miss.push(requestKeyHash);

                _tell('Request on endpoint \'' + reqContext.endpoint.key + '\' missed', {miss: true, requestKeyHash: requestKeyHash});


        }

        // publish
        Nocca.pubsub.publish(
            $constants.PUBSUB_STATS_UPDATED,
            [ dump() ]
        );

        return reqContext;

    }

    function _tell (line, obj) {

        obj = obj || {};

        obj.timestamp = new Date().getTime();
        obj.line = line;

        stats.storyLog.push(obj);

        return obj;

    }

    function dump () {

        // export stats!
        return stats;

    }

}

