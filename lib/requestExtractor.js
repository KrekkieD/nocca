'use strict';

var $q = require('q');
var $utils = require('./utils');

module.exports = RequestExtractor;

function RequestExtractor(Nocca) {

    return extractor;

    /**
     * Stores properties from the incoming request and attempts to read the body sent along with the
     * request. All this is then stuffed in one object and fed into the promise.
     *
     * @param reqContext the request to flatten into an object
     * @returns {*|Document.promise|k.promise|{then, catch, finally}|promise}
     */
    function extractor (reqContext) {

        var deferred = $q.defer();

        var httpMessage = Nocca.httpMessageFactory.createRequest();

        httpMessage.readIncomingMessage(reqContext.httpRequest)
            .then(function () {
                return httpMessage.unpack();
            })
            .then(function () {

                reqContext.setClientRequest(httpMessage);

                deferred.resolve(reqContext);

            }).fail(function(err) {

                reqContext.statusCode = 400;
                reqContext.message = err.message;
                reqContext.err = err;

                deferred.reject(reqContext);

            });


        return deferred.promise;

    }


}