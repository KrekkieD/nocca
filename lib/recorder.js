'use strict';

var $utils = require('./utils');

var $q = require('q');

module.exports = Recorder;

function Recorder (Nocca) {

    return simpleResponseRecorder;

    function simpleResponseRecorder (reqContext) {

        var deferred = $q.defer();

        var proxyResponse = reqContext.getProxyResponse();

        if (proxyResponse) {
            Nocca.logInfo('Recording proxied response');

            var mockEntry = {
                requestKey: reqContext.requestKey,
                hits: 0,
                statusCode: proxyResponse.statusCode,
                headers: $utils.camelCaseAndDashHeaders(proxyResponse.headers, [], []),
                body: proxyResponse.getBody()
            };

            reqContext.config.playback.recorder(reqContext.endpoint.key, reqContext.requestKey, mockEntry);

            reqContext.flagRecorded = true;

        }

        deferred.resolve(reqContext);

        return deferred.promise;

    }

}


