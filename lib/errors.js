'use strict';
var $q = require('q');

module.exports = ErrorHandler;

function ErrorHandler (Nocca) {

    this.chainRejected = chainRejected;
    this.chainError= chainError;

    function chainRejected (reqContext) {

        var deferred = $q.defer();

        Nocca.logWarning('Unable to complete request: ' + (reqContext.errorMessage || reqContext.message));

        var httpResponse = reqContext.httpResponse;

        httpResponse.writeHead(reqContext.statusCode || 500, {
            'Nocca-Error': '"' + (reqContext.errorCode || reqContext.message) + '"'
        });

        if (reqContext.stack) {
            Nocca.logError(reqContext.stack);
        }

        httpResponse.end(reqContext.errorMessage || reqContext.message);

        deferred.resolve(reqContext);

        return deferred.promise;

    }

    function chainError (httpResponse) {

        return function (err) {

            Nocca.logWarning('Caught an error during request processing, terminating request');
            Nocca.logWarning(err.message);
            Nocca.logError(err.stack);

            httpResponse.writeHead(500, {
                'Nocca-Error': '"Internal error while processing request: ' + err.message + '"'
            });

            httpResponse.end();

        };

    }

}
