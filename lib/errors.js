'use strict';

var $q = require('q');

module.exports = {};
module.exports.defaultFailureHandlerFactory = defaultFailureHandlerFactory;
module.exports.defaultThrowHandlerFactory = defaultThrowHandlerFactory;

function defaultFailureHandlerFactory (reqContext) {

    var deferred = $q.defer();

    var httpResponse = reqContext.httpResponse;

    httpResponse.writeHead(reqContext.statusCode || 500, {
        'Nocca-Error': '"' + (reqContext.errorCode || reqContext.message) + '"'
    });

    console.log('|    Unable to complete request: ' + (reqContext.errorMessage || reqContext.message));
    if (reqContext.stack) {
        console.error(reqContext.stack);
    }

    httpResponse.end(reqContext.errorMessage || reqContext.message);

    deferred.resolve(reqContext);

    return deferred.promise;

}

function defaultThrowHandlerFactory (httpResponse) {
    
    return function(err) {

        console.log('Caught an error during request processing, terminating request');
        console.log(err.message);
        console.error(err.stack);

        httpResponse.writeHead(500, {
            'Nocca-Error': '"Internal error while processing request: ' + err.message + '"'
        });

        httpResponse.end();

    };
    
}