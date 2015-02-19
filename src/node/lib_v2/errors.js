'use strict';

module.exports = {};
module.exports.defaultFailureHandler      = defaultFailureHandler;
module.exports.defaultThrowHandlerFactory = defaultThrowHandlerFactory;

function defaultFailureHandler(reqContext) {
    
    console.log('|    Unable to complete request: ' + reqContext.error);
    
    reqContext.httpResponse.writeHead(reqContext.statusCode, {'Nocca-Error': '"' + reqContext.error + '"'});
    reqContext.httpResponse.end();
    
}

function defaultThrowHandlerFactory(httpResponse) {
    
    return function(err) {

        console.log('Caught an error during request processing, terminating request');
        console.log(err.message);
        console.log(err.stack);

        httpResponse.writeHead(500, {'Nocca-Error': '"Internal error while processing request: ' + err.message + '"'});
        httpResponse.end();

    };
    
}