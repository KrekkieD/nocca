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
        sequences: {},
        requestKeys: {},
		endpoints: {},
        responses: {},
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
            sequences: {},
			responses: {},
			endpoints: {},
			recorded: [],
			forwarded: [],
			replayed: [],
			miss: [],
			storyLog: []
		};

        // log hash for easier visualisation of uniqueness
        //var sha1 = $crypto.createHash('sha1');
        //var requestKeyHash = sha1.update([
        //    reqContext.endpoint.key,
        //    reqContext.requestKey
        //].join('|')).digest('base64');


        // extract the sequence properties
        var sequence = {
            id: reqContext.sequenceId,
            //hash: requestKeyHash,
            timestamp: reqContext.requestStartTime,
            requestKey: reqContext.requestKey,
            endpoint: reqContext.endpoint.key,
            clientRequest: reqContext.getClientRequest(),
            proxyRequest: reqContext.getProxyRequest() || null,
            proxyResponse: reqContext.getProxyResponse() || null,
            proxyResponseId: reqContext.getProxyResponse() ? reqContext.getProxyResponse().messageKey() : null,
            playbackResponse: reqContext.getPlaybackResponse() || null,
            playbackResponseId: reqContext.getPlaybackResponse() ? reqContext.getPlaybackResponse().messageKey() : null,
            clientResponse: reqContext.getClientResponse() || null,
            clientResponseId: reqContext.getClientResponse() ? reqContext.getClientResponse().messageKey() : null,
			recorded: reqContext.flagRecorded,
			forwarded: reqContext.flagForwarded,
			replayed: reqContext.flagReplayed,
			missed: reqContext.flagCachemiss
        };


        // parse sequence into usage statistics
        stats.sequences[sequence.id] = {
            id: sequence.id,
            timestamp: sequence.timestamp,
            requestKey: sequence.requestKey,
            endpoint: sequence.endpoint,
            clientRequest: sequence.clientRequest.dump(),
            proxyRequest: sequence.proxyRequest ? sequence.proxyRequest.dump() : sequence.proxyRequest,
            proxyResponse: sequence.proxyResponse ? sequence.proxyResponse.dump() : null,
            proxyResponseId: sequence.proxyResponseId,
            playbackResponse: sequence.playbackResponse ? sequence.playbackResponse.dump() : null,
            playbackResponseId: sequence.playbackResponseId,
            clientResponse: sequence.clientResponse ? sequence.clientResponse.dump() : null,
            clientResponseId: sequence.clientResponseId,
			recorded: sequence.recorded,
			forwarded: sequence.forwarded,
			replayed: sequence.replayed,
			missed: sequence.missed
        };

        // log sequence for requestKey
        stats.requestKeys[sequence.requestKey] = stats.requestKeys[sequence.requestKey] || [];
        stats.requestKeys[sequence.requestKey].push(sequence.id);

        // log the use of the clientResponseId
        stats.responses[sequence.clientResponseId] = stats.responses[sequence.clientResponseId] || {
            message: sequence.clientResponse.dump(),
            usage: []
        };
        stats.responses[sequence.clientResponseId].usage.push(sequence.id);

        // log the use of the endpoint
        stats.endpoints[sequence.endpoint] = stats.endpoints[sequence.endpoint] || [];
        stats.endpoints[sequence.endpoint].push(sequence.id);

        // only log the response once to prevent overwrites
        //if (typeof stats.responses[requestKeyHash] === 'undefined') {
        //
        //    stats.responses[requestKeyHash] = {
        //        hash: requestKeyHash,
        //        timestamp: reqContext.requestStartTime,
        //        requestKey: reqContext.requestKey,
        //        clientRequest: reqContext.getClientRequest().dump(),
        //        proxyRequest: reqContext.getProxyRequest() ? reqContext.getProxyRequest().dump() : null,
        //        proxyResponse: reqContext.getProxyResponse() ? reqContext.getProxyResponse().dump() : null,
        //        playbackResponse: reqContext.getPlaybackResponse() ? reqContext.getPlaybackResponse().dump() : null,
        //        clientResponse: reqContext.getClientResponse() ? reqContext.getClientResponse().dump() : null,
        //        endpoint: reqContext.endpoint
        //    };
        //
        //}
        //
        //// register sequence
        //changeLog.sequences[reqContext.sequenceId] = {
        //    clientRequest: reqContext.getClientRequest().dump(),
        //    proxyRequest: reqContext.getProxyRequest() ? reqContext.getProxyRequest().dump() : null,
        //    proxyResponseId: reqContext.getProxyResponse() ? reqContext.getProxyResponse().messageKey() : null,
        //    playbackResponseId: '',
        //    clientResponseId: ''
        //};

		// add response to change
		//changeLog.responses[requestKeyHash] = stats.responses[requestKeyHash];

        // add the endpoint log
        //stats.endpoints[reqContext.endpoint.key] = stats.endpoints[reqContext.endpoint.key] || [];
        //stats.endpoints[reqContext.endpoint.key].push(requestKeyHash);

		// add response to change
		//changeLog.endpoints[reqContext.endpoint.key] = [requestKeyHash];

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
                stats.recorded.push(sequence.id);
				changeLog.recorded.push(sequence.id);

				changeLog.storyLog.push(_tell(
					'Request on ' + reqContext.endpoint.key + ' recorded and forwarded',
					{rec: true, fwd: true, requestKeyHash: sequence.id}
				));

                break;
            case '1010':
                // recorded and forwarded
                stats.recorded.push(sequence.id);
                changeLog.recorded.push(sequence.id);

                // replayed
                stats.replayed.push(sequence.id);
                changeLog.replayed.push(sequence.id);

                changeLog.storyLog.push(_tell(
                    'Request on ' + reqContext.endpoint.key + ' replayed and re-recorded',
                    {rec: true, rpl: true, requestKeyHash: sequence.id}
                ));

                break;
            case '0100':
                // forwarded, not recorded
                stats.forwarded.push(sequence.id);
				changeLog.forwarded.push(sequence.id);

				changeLog.storyLog.push(_tell(
					'Request on ' + reqContext.endpoint.key + ' forwarded',
					{fwd: true, requestKeyHash: sequence.id}
				));

                break;
            case '0010':
                // replayed
                stats.replayed.push(sequence.id);
				changeLog.replayed.push(sequence.id);

				changeLog.storyLog.push(_tell(
					'Request on ' + reqContext.endpoint.key + ' replayed',
					{rpl: true, requestKeyHash: sequence.id}
				));

                break;
            case '0001':

                // could not respond
                stats.miss.push(sequence.id);
				changeLog.miss.push(sequence.id);

				changeLog.storyLog.push(_tell(
					'Request on endpoint \'' + reqContext.endpoint.key + '\' missed, no response found',
					{miss: true, requestKeyHash: sequence.id}
				));

                break;
            default:

                stats.miss.push(sequence.id);
				changeLog.miss.push(sequence.id);

				changeLog.storyLog.push(_tell(
					'Request on endpoint \'' + reqContext.endpoint.key + '\' missed',
					{miss: true, requestKeyHash: sequence.id, flagString: flagString}
				));


        }


        // publish
        Nocca.pubsub.publish(
            $constants.PUBSUB_STATS_UPDATED,
            [ stats ]
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

