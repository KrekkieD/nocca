'use strict';

var $q = require('q');

module.exports = Responder;

function Responder (Nocca) {

    var self = this;

    self.logger = Nocca.logger.child({ module: 'Responder' });
    self.respond = respond;

    function respond (reqContext) {

        var deferred = $q.defer();

        if (reqContext.getPlaybackResponse()) {
			self.logger.info('Playing back pre-recorded response');

            reqContext.flagReplayed = true;
            reqContext.setClientResponse(reqContext.getPlaybackResponse());

        }
        else if (reqContext.getProxyResponse()) {
            self.logger.info('Returning response from forwarded request');

            reqContext.flagForwarded = true;
            reqContext.setClientResponse(reqContext.getProxyResponse());

        }
        else {
            reqContext.flagCachemiss = true;
        }


        if (reqContext.getClientResponse()) {


            // process transformation
            if (typeof reqContext.config.messageTransformer !== 'undefined') {

                Nocca.usePlugin(reqContext.config.messageTransformer).transformMessage(reqContext);

            }

            if (typeof reqContext.config.delay !== 'undefined') {

                Nocca.usePlugin(reqContext.config.delay)(reqContext)
                    .then(function () {
                        deferred.resolve(reqContext);
                        _writeResponseToOutput(reqContext);
                    });

            }
            else {

                deferred.resolve(reqContext);
                _writeResponseToOutput(reqContext);

            }

        }
        else {

            reqContext.errorCode = Nocca.constants.ERRORS.NO_RESPONSE_FOUND;
            reqContext.errorMessae = 'Could not respond to request as no response could be found';
            reqContext.statusCode = 404;

            deferred.reject(reqContext);

        }

        return deferred.promise;

    }

    function _writeResponseToOutput(reqContext) {

        return reqContext.getClientResponse()
            .sendAsResponse(reqContext.httpResponse);

    }

}



