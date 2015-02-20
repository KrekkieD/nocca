'use strict';

module.exports = {};
module.exports.defaultFailureHandlerFactory = defaultFailureHandlerFactory;
module.exports.defaultThrowHandlerFactory   = defaultThrowHandlerFactory;

function defaultFailureHandlerFactory(httpResponse) {

    return function(reqContextOrError) {

        console.log('|    Unable to complete request: ' + (reqContextOrError.error || reqContextOrError.message));
        if (reqContextOrError.stack) {
            console.error(reqContextOrError.stack);
            
        }

        httpResponse.writeHead(reqContextOrError.statusCode || 500, {'Nocca-Error': '"' + (reqContextOrError.error || reqContextOrError.message) + '"'});
        httpResponse.end();
    };
}

function defaultThrowHandlerFactory(httpResponse) {
    
    return function(err) {

        console.log('Caught an error during request processing, terminating request');
        console.log(err.message);
        console.error(err.stack);

        httpResponse.writeHead(500, {'Nocca-Error': '"Internal error while processing request: ' + err.message + '"'});
        httpResponse.end();

    };
    
}