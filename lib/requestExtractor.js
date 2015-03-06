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
     * @param req the request to flatten into an object
     * @returns {*|Document.promise|k.promise|{then, catch, finally}|promise}
     */
    function extractor(reqContext) {

        var deferred = $q.defer();

        reqContext.request = {
            url: reqContext.httpRequest.url,
            method: reqContext.httpRequest.method,
            path: reqContext.httpRequest.path,
            headers: reqContext.httpRequest.headers
        };

        $utils.readBody(reqContext.httpRequest)
            .then(function(body) {
                reqContext.request.body = body || '';

                deferred.resolve(reqContext);
            }).fail(function(err) {

                reqContext.statusCode = 502;
                reqContext.message = err.message;
                reqContext.err = err;

                deferred.reject(reqContext);

            });


        return deferred.promise;

    }


}