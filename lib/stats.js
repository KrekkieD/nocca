'use strict';

var $constants = require('./constants');

var $crypto = require('crypto');
var $extend = require('extend');

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
		endpoints: {},
		recorded: [],
        forwarded: [],
        replayed: [],
        miss: [],
        storyLog: []
    };

    function log (reqContext) {

        if (typeof reqContext.requestKey === 'undefined') {
            Nocca.logDebug('On the fly key generation');
            return Nocca.config.keyGenerator(reqContext).then(log);
        }

		// keep track of stats mutation so we can pubsub a light version of the change
		var changeLog = {
			responses: {},
			endpoints: {},
			recorded: [],
			forwarded: [],
			replayed: [],
			miss: [],
			storyLog: []
		};

        // log hash for easier visualisation of uniqueness
        var sha1 = $crypto.createHash('sha1');
        var requestKeyHash = sha1.update(reqContext.requestKey).digest('base64');

        // only log the response once to prevent overwrites
        if (typeof stats.responses[requestKeyHash] === 'undefined') {

            stats.responses[requestKeyHash] = {
                hash: requestKeyHash,
                timestamp: reqContext.requestStartTime,
                requestKey: reqContext.requestKey,
                clientRequest: reqContext.getClientRequest().dump(),
                proxyRequest: reqContext.getProxyRequest() ? reqContext.getProxyRequest().dump() : null,
                proxyResponse: reqContext.getProxyResponse() ? reqContext.getProxyResponse().dump() : null,
                playbackResponse: reqContext.getPlaybackResponse() ? reqContext.getPlaybackResponse().dump() : null,
                clientResponse: reqContext.getClientResponse() ? reqContext.getClientResponse().dump() : null,
                endpoint: reqContext.endpoint
            };

        }

		// add response to change
		changeLog.responses[requestKeyHash] = stats.responses[requestKeyHash];

        // add the endpoint log
        stats.endpoints[reqContext.endpoint.key] = stats.endpoints[reqContext.endpoint.key] || [];
        stats.endpoints[reqContext.endpoint.key].push(requestKeyHash);

		// add response to change
		changeLog.endpoints[reqContext.endpoint.key] = [requestKeyHash];

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
				changeLog.recorded.push(requestKeyHash);

				changeLog.storyLog.push(_tell(
					'Request on ' + reqContext.endpoint.key + ' recorded and forwarded',
					{rec: true, fwd: true, requestKeyHash: requestKeyHash}
				));

                break;
            case '0100':
                // forwarded, not recorded
                stats.forwarded.push(requestKeyHash);
				changeLog.forwarded.push(requestKeyHash);

				changeLog.storyLog.push(_tell(
					'Request on ' + reqContext.endpoint.key + ' forwarded',
					{fwd: true, requestKeyHash: requestKeyHash}
				));

                break;
            case '0010':
                // replayed
                stats.replayed.push(requestKeyHash);
				changeLog.replayed.push(requestKeyHash);

				changeLog.storyLog.push(_tell(
					'Request on ' + reqContext.endpoint.key + ' replayed',
					{rpl: true, requestKeyHash: requestKeyHash}
				));

                break;
            case '0001':

                // could not respond
                stats.miss.push(requestKeyHash);
				changeLog.miss.push(requestKeyHash);

				changeLog.storyLog.push(_tell(
					'Request on endpoint \'' + reqContext.endpoint.key + '\' missed, no response found',
					{miss: true, requestKeyHash: requestKeyHash}
				));

                break;
            default:

                stats.miss.push(requestKeyHash);
				changeLog.miss.push(requestKeyHash);

				changeLog.storyLog.push(_tell(
					'Request on endpoint \'' + reqContext.endpoint.key + '\' missed',
					{miss: true, requestKeyHash: requestKeyHash}
				));


        }


        // publish
        Nocca.pubsub.publish(
            $constants.PUBSUB_STATS_UPDATED,
            [ changeLog ]
        );

        return reqContext;

    }

    function _tell (line, obj) {

        obj = obj || {};

        obj.timestamp = new Date().getTime();
        obj.line = line;
        obj.id = stats.storyLog.length;

        stats.storyLog.push(obj);

        return obj;

    }

    function dump () {

        // export stats!
        return stats;

    }

}

