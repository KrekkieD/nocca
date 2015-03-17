'use strict';

var $q = require('q');

module.exports = Recorder;

function Recorder (Nocca) {

    return simpleResponseRecorder;

    function simpleResponseRecorder (reqContext) {

        var deferred = $q.defer();

        var proxyResponse = reqContext.getProxyResponse();

        if (proxyResponse) {
            Nocca.logInfo('Recording proxied response');

            Nocca.playback.addRecording(
                reqContext.endpoint.key,
                reqContext.requestKey,
                proxyResponse
            );

            reqContext.flagRecorded = true;

        }

        deferred.resolve(reqContext);

        return deferred.promise;

    }

}


