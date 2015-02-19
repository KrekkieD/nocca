'use strict';

var $nocca2 = require('../index_v2');

var config = {
    record: true,
    // false, true, 'MISSING'
    forward: 'MISSING'
}

$nocca2.caches.newEndpoint('google', 'http://www.google.com/');

$nocca2.server(3003, function(reqPromise) {
    
    var requestChain = reqPromise.then($nocca2.caches.selector);
    
    requestChain = requestChain.then($nocca2.keys.defaultGenerator);

    // I think this step doesn't do shit... The flattened request is all that's needed, the response should be recorded
    if (config.record) {
        requestChain = requestChain.then($nocca2.recorder.recordRequest);
    }
    
    if (config.forward === false || config.forward === 'MISSING') {
        // Forward is either false or 'MISSING', meaning we try to playback before forwarding
        requestChain = requestChain.then($nocca2.playback.defaultRequestMatcher);
    }
    
    if (config.forward === true || config.forward === 'MISSING') {
        // Forwarding is on, the default forwarder will only forward if the request context contains no matched response
        requestChain = requestChain.then($nocca2.forwarder.forward);
    }
    
    // After this point, we either have a pre-recorded response to playback, or an actual response to playback
    
    if (config.record) {
        requestChain = requestChain.then($nocca2.recorder.recordResponse);
    }
    
    requestChain = requestChain.then($nocca2.responder.respond);


    requestChain.fail(function(reqContext) {
        
        reqContext.httpResponse.writeHead(reqContext.statusCode, {'Nocca-Error': '"' + reqContext.error + '"'});
        reqContext.httpResponse.end();

    });
    requestChain.catch(function(error) {

        console.log('Caught an error during request processing, terminating request');
        console.log(error.message);
        console.log(error.stack);

        reqContext.httpResponse.writeHead(500, {'Nocca-Error': '"Internal error while processing request: ' + error.message + '"'});
        reqContext.httpResponse.end();

    });
    
    requestChain.finally(function() {
        // Update statistics
        // publishStatistics();
        
        console.log('|    Processing ended, now would be a good time to publish new stats!');
    });
    
});