'use strict';

var $utils = require('./utils');

var $q = require('q');

module.exports = {};
module.exports.simpleResponseRecorder = simpleResponseRecorder;


function simpleResponseRecorder (reqContext) {

    var deferred = $q.defer();

    if (reqContext.proxiedResponse) {
        console.log('|    Recording proxied response');
    
        var mockEntry = {
            requestKey: reqContext.requestKey,
            hits: 0,
            statusCode: reqContext.proxiedResponse.statusCode,
            headers: $utils.camelCaseAndDashHeaders(reqContext.proxiedResponse.headers, [], []),
            body: reqContext.proxiedResponse.body
        };

        reqContext.opts.playback.recorder(reqContext.endpoint.key, reqContext.requestKey, mockEntry);

        reqContext.flagRecorded = true;

    }

    deferred.resolve(reqContext);
    
    return deferred.promise;
    
}

