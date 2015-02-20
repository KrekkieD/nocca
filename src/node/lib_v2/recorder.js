'use strict';

module.exports = {};
module.exports.simpleRecorder  = simpleResponseRecorder;
module.exports.defaultRecorder = simpleResponseRecorder;

var $q = require('q');
var $utils = require('./utils');
var $playback = require('./playback');



function simpleResponseRecorder(reqContext) {
    var d = $q.defer();

    if (reqContext.proxiedResponse) {
        console.log('|    Recording proxied response');
    
        var mockEntry = {
            requestKey: reqContext.requestKey,
            hits: 0,
            statusCode: reqContext.proxiedResponse.statusCode,
            headers: $utils.camelCaseAndDashHeaders(reqContext.proxiedResponse.headers, [], []),
            body: reqContext.proxiedResponse.body
        };

        $playback.addRecording(reqContext.endpoint.key, reqContext.requestKey, mockEntry);

        reqContext.flagRecorded = true;

    }
    
    d.resolve(reqContext);
    
    return d.promise;
    
}

