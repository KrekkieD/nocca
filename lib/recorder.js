'use strict';

var _ = require('lodash');
var $q = require('q');

module.exports = Recorder;

function Recorder (Nocca) {

    return simpleResponseRecorder;

    function simpleResponseRecorder (reqContext) {

        var deferred = $q.defer();

        // check if we want to record this request, and what httpMessage we want to use,
        // then add to reqContext
        reqContext.config.recordingSubject = _extractRecordingSubject(reqContext);

        if (reqContext.config.recordingSubject !== false) {

            var acceptedRepository = _.find(Nocca.repositories, function (repository) {
                return repository.considerRecording(reqContext);
            });

            reqContext.flagRecorded = typeof acceptedRepository !== 'undefined';

            if (reqContext.flagRecorded) {
                Nocca.logInfo('Proxied response was recorded into repository: ' + acceptedRepository.name());

            }
            else {
                Nocca.logInfo('Recorded proxied response');

            }

        }

        deferred.resolve(reqContext);

        return deferred.promise;

    }

    function _extractRecordingSubject (reqContext) {

        var recordThis = false;
        var record = reqContext.config.record;

        if (record === true) {
            // when true, change the value to an array with a default recording order
            recordThis = [
                Nocca.constants.HTTP_MESSAGE_TYPES.PROXY_RESPONSE,
                Nocca.constants.HTTP_MESSAGE_TYPES.PLAYBACK_RESPONSE
            ];

        }
        else if (typeof record === 'string') {
            // cast to array
            record = [record];
        }

        // handle the order of the messages in which to determine recording
        if (Array.isArray(record)) {
            // specifies order of what to record
            for (var i = 0, iMax = record.length; i < iMax; i++) {

                // is an httpMessage for this type present?
                if (reqContext.getHttpMessage(record[i])) {
                    recordThis = record[i];
                    break;
                }

            }
        }

        return recordThis;

    }

}


