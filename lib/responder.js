'use strict';

var $q = require('q');
var $zlib = require('zlib');

module.exports = Responder;

function Responder (Nocca) {

    var self = this;

    self.respond = playbackPreferringResponder;

    function playbackPreferringResponder (reqContext) {

        var deferred = $q.defer();

        if (reqContext.getPlaybackResponse()) {
			Nocca.logInfo('Playing back pre-recorded response');

            reqContext.flagReplayed = true;
            reqContext.setClientResponse(reqContext.getPlaybackResponse());

        }
        else if (reqContext.getProxyResponse()) {
            Nocca.logInfo('Returning response from forwarded request');

            reqContext.flagForwarded = true;
            reqContext.setClientResponse(reqContext.getProxyResponse());

        }
        else {
            reqContext.flagCachemiss = true;
        }


        if (reqContext.getClientResponse()) {

            _delayResponsePerConfiguration(reqContext)
                .then(function () {
                    deferred.resolve(reqContext);
                    _writeResponseToOutput(reqContext);
                });

        }
        else {

            reqContext.errorCode = Nocca.constants.ERRORS.NO_RESPONSE_FOUND;
            reqContext.errorMessae = 'Could not respond to request as no response could be found';
            reqContext.statusCode = 404;

            deferred.reject(reqContext);

        }

        return deferred.promise;

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

        return reqContext.getClientResponse()
            .sendAsResponse(reqContext.httpResponse);

    }

}



