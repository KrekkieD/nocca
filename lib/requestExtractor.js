'use strict';

module.exports = RequestExtractor;

function RequestExtractor (Nocca) {

    return extractor;

    /**
     * Stores properties from the incoming request and attempts to read the body sent along with the
     * request. All this is then stuffed in one object and fed into the promise.
     *
     * @param reqContext the request to flatten into an object
     * @returns {*|Document.promise|k.promise|{then, catch, finally}|promise}
     */
    function extractor (reqContext) {

        var httpMessage = Nocca.httpMessageFactory.createRequest();

        return httpMessage.readIncomingMessage(reqContext.httpRequest)
            .then(function () {

                return httpMessage.unpack();

            })
            .then(function () {

                reqContext.setClientRequest(httpMessage);

                return reqContext;

            }).fail(function () {

                reqContext.errors.throwRequestExtractionError();

            });

    }


}
