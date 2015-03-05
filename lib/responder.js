'use strict';

var $q = require('q');
var $buffer = require('buffer');

module.exports = Responder;
//module.exports.simpleResponder = playbackPreferringResponder;

function Responder (Nocca) {

    var self = this;

    self.respond = playbackPreferringResponder;

    function playbackPreferringResponder(reqContext) {

        if (typeof reqContext.playbackResponse !== 'undefined') {
			Nocca.logInfo('Playing back recorded response');

            reqContext.flagReplayed = true;
            reqContext.response = reqContext.playbackResponse;

        }
        else if (typeof reqContext.proxiedResponse !== 'undefined') {
            Nocca.logInfo('Returning response from forwarded request');

            reqContext.flagForwarded = true;
            reqContext.response = reqContext.proxiedResponse;
        }
        else {
            throw new Error('No data to write to response');
        }

        _delayResponsePerConfiguration(reqContext).then(function () {
            _writeResponseToOutput(reqContext);
        });


        return reqContext;

    }

    function _delayResponsePerConfiguration (reqContext) {

        var deferred = $q.defer();

        reqContext.requestRespondTime = new Date().getTime();

        reqContext.requestDelayed = Math.max(Nocca.config.delay - (reqContext.requestRespondTime - reqContext.requestStartTime), 0);

        setTimeout(function () {
            deferred.resolve(reqContext);
        }, reqContext.requestDelayed);

        return deferred.promise;

    }

    function _writeResponseToOutput(reqContext) {

        // node always uses lowercase headers, so this lowercase check will suffice
        if (reqContext.response.headers.hasOwnProperty('content-length')) {

            var bodyLength = Buffer.byteLength(reqContext.response.body);
            var contentLength = parseInt(reqContext.response.headers['content-length']);

            if (bodyLength !== contentLength) {
                Nocca.logDebug('Content-Length header mismatches actual body size, adjusting header');
				reqContext.response.headers['content-length'] = bodyLength;
            }
        }

		reqContext.httpResponse.writeHead(reqContext.response.statusCode, reqContext.response.headers);
        Nocca.logInfo('Status: ' + reqContext.response.statusCode);
        if (reqContext.response.body) {
            reqContext.httpResponse.end(reqContext.response.body);
        }
        else {
            reqContext.httpResponse.end();
        }

    }

}



