'use strict';

module.exports = {};
module.exports.defaultRequestMatcher = defaultRequestMatcher;
module.exports.addRecording = addRecording;

var $q = require('q');

var recordings = {};

function addRecording(endpoint, requestKey, recordedResponse) {
    
    if (!recordings.hasOwnProperty(endpoint)) {
        recordings[endpoint] = {};
    }
    
    recordings[endpoint][requestKey] = recordedResponse;
    
}

function defaultRequestMatcher(reqContext) {
    var d = $q.defer();
    
    try {
        var recording = recordings[reqContext.endpoint.key][reqContext.requestKey];
        
        reqContext.playbackResponse = recording;
        console.log('|    Found a matching record!');
    }
    catch(err) {
        // Probably no recording found, just return the context as is
        console.log('|    No matching record found');
    }
    
    d.resolve(reqContext);

    return d.promise;

}