'use strict';

module.exports = {};
module.exports.defaultFailureHandlerFactory = defaultFailureHandlerFactory;
module.exports.defaultThrowHandlerFactory   = defaultThrowHandlerFactory;

function defaultFailureHandlerFactory (context) {

    var httpResponse = context.httpResponse;

    console.log('|    Unable to complete request: ' + (context.error || context.message));
    if (context.stack) {
        console.error(context.stack);

    }

    httpResponse.writeHead(context.statusCode || 500, {'Nocca-Error': '"' + (context.error || context.message) + '"'});
    httpResponse.end();

}

function defaultThrowHandlerFactory (httpResponse) {
    
    return function(err) {

        console.log('Caught an error during request processing, terminating request');
        console.log(err.message);
        console.error(err.stack);

        httpResponse.writeHead(500, {'Nocca-Error': '"Internal error while processing request: ' + err.message + '"'});
        httpResponse.end();

    };
    
}