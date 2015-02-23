'use strict';

module.exports = {};
module.exports.defaultRequestMatcher          = simpleRequestKeyRequestMatcher;
module.exports.simpleRequestKeyRequestMatcher = simpleRequestKeyRequestMatcher;
module.exports.scenarioBasedRequestMatcher    = scenarioBasedRequestMatcher;
module.exports.addRecording                   = addSingleRecording;
module.exports.addScenario                    = addSingleScenario;
module.exports.exportRecordings               = exportRecordings;

var $q = require('q');

var recordings = {};
var scenarios = {};

function addSingleRecording (endpoint, requestKey, recordedResponse) {

    // ensure presence of endpoint
    recordings[endpoint] = recordings[endpoint] || {};
    
    recordings[endpoint][requestKey] = recordedResponse;
    
}

function simpleRequestKeyRequestMatcher (reqContext) {
    var deferred = $q.defer();

    if (typeof recordings[reqContext.endpoint.key] !== 'undefined' &&
        typeof recordings[reqContext.endpoint.key][reqContext.requestKey] !== 'undefined') {

        reqContext.playbackResponse = recordings[reqContext.endpoint.key][reqContext.requestKey];
        console.log('|    Found a matching record!');

    }
    else {
        // Probably no recording found, just return the context as is
        console.log('|    No matching record found');
    }

    deferred.resolve(reqContext);

    return deferred.promise;

}

function scenarioBasedRequestMatcher(reqContext) {
    
    
    
}

function addSingleScenario(scenario) {



}

function exportRecordings () {

    return recordings;

}