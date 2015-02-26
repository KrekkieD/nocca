'use strict';

var $nocca = require(__dirname + '/../index');

var $q = require('q');

module.exports = {};
module.exports.simpleRecorder = simpleResponseRecorder;
module.exports.defaultRecorder = simpleResponseRecorder;


function simpleResponseRecorder (reqContext) {
    var d = $q.defer();

    if (reqContext.proxiedResponse) {
        console.log('|    Recording proxied response');
    
        var mockEntry = {
            requestKey: reqContext.requestKey,
            hits: 0,
            statusCode: reqContext.proxiedResponse.statusCode,
            headers: $nocca.$utils.camelCaseAndDashHeaders(reqContext.proxiedResponse.headers, [], []),
            body: reqContext.proxiedResponse.body
        };

        reqContext.opts.playback.recorder(reqContext.endpoint.key, reqContext.requestKey, mockEntry);

        reqContext.flagRecorded = true;

    }
    
    d.resolve(reqContext);
    
    return d.promise;
    
}

