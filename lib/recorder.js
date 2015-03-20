'use strict';

var _ = require('lodash');
var $q = require('q');

module.exports = Recorder;

function Recorder (Nocca) {

    return simpleResponseRecorder;

    function simpleResponseRecorder (reqContext) {

        var deferred = $q.defer();

        if (reqContext.getProxyResponse()) {

            var acceptedRepository = _.find(Nocca.repositories, function(repository) { repository.considerRecording(reqContext); });

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

}


