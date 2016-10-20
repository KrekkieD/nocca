'use strict';

var $q = require('q');

module.exports = Responder;

function Responder (Nocca) {

    var self = this;

    self.logger = Nocca.logger.child({ module: 'Responder' });
    self.respond = respond;

    function respond (reqContext) {

        var deferred = $q.defer();


        if (reqContext.getProxyResponse()) {
            self.logger.info('<< Response from endpoint');

            reqContext.flagForwarded = true;
            reqContext.setClientResponse(reqContext.getProxyResponse());

        }
        else if (reqContext.getPlaybackResponse()) {
            self.logger.info('<< Response from cache');

            reqContext.flagReplayed = true;
            reqContext.setClientResponse(reqContext.getPlaybackResponse());

        }
        else {
            self.logger.error('No proxy or playback response, cannot respond');
            reqContext.flagCachemiss = true;
        }


        if (reqContext.getClientResponse()) {

            // process transformation
            if (typeof reqContext.config.messageTransformer !== 'undefined') {

                Nocca.usePlugin(reqContext.config.messageTransformer).transformMessage(reqContext);

            }

            if (typeof reqContext.config.responseDelay !== 'undefined') {

                Nocca.usePlugin(reqContext.config.responseDelay)(reqContext)
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

            reqContext.errors.throwNoClientResponseError();

        }

        return deferred.promise;

    }

    function _writeResponseToOutput (reqContext) {

        return reqContext.getClientResponse()
            .sendAsResponse(reqContext.httpResponse);

    }

}



