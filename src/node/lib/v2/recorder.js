'use strict';

module.exports = {};
module.exports.recordRequest  = defaultRequestRecorder;
module.exports.recordResponse = defaultResponseRecorder;

var $q = require('q');
var $utils = require('./utils');
var $playback = require('./playback');

function defaultRequestRecorder(reqContext) {
    var d = $q.defer();
    
    console.log('|    Recording incoming request');
    d.resolve(reqContext);
    
    return d.promise;
    
}

function defaultResponseRecorder(reqContext) {
    var d = $q.defer();

    if (reqContext.proxiedResponse) {
        console.log('|    Recording proxied response');
    
        var mockEntry = {
            requestKey: reqContext.requestKey,
            hits: 0,
            statusCode: reqContext.proxiedResponse.statusCode,
            headers: $utils.camelCaseAndDashHeaders(reqContext.proxiedResponse.headers, [], []),
            body: reqContext.proxiedResponse.data
        }
        
        $playback.addRecording(reqContext.endpoint.key, reqContext.requestKey, mockEntry);
    }
    
    d.resolve(reqContext);
    
    return d.promise;
    
}