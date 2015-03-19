'use strict';
// TODO: should be instance! cannot use Nocca reference
var $q = require('q');

module.exports = CacheEntries;

function CacheEntries (Nocca) {

    var recordings = {};

    this.matchRequest = simpleRequestKeyRequestMatcher;
    this.addRecording = addSingleRecording;
    this.exportRecordings = exportRecordings;

// --- Simple recording playback

    function addSingleRecording (endpoint, requestKey, recordedResponse) {

        // ensure presence of endpoint
        recordings[endpoint] = recordings[endpoint] || {};

        recordings[endpoint][requestKey] = recordedResponse;

    }

    function simpleRequestKeyRequestMatcher (reqContext) {
        var response = null;
        
        if (typeof recordings[reqContext.endpoint.key] !== 'undefined' &&
            typeof recordings[reqContext.endpoint.key][reqContext.requestKey] !== 'undefined') {

            response = recordings[reqContext.endpoint.key][reqContext.requestKey];

            Nocca.logInfo('Found a matching record using simpleMatcher!');

        }
        else {
            // Probably no recording found, just return the context as is
            Nocca.logDebug('No matching record found using simpleMatcher');
        }

        return response;

    }

// --- Export data
    function exportRecordings (endpoint, key) {

        return (typeof endpoint !== 'undefined' && typeof key !== 'undefined') ? recordings[endpoint][key] : recordings ;

    }

}
