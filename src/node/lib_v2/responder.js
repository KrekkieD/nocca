'use strict';

module.exports = {};
module.exports.defaultResponder = playbackPreferringResponder;
module.exports.simpleResponder  = playbackPreferringResponder;

function playbackPreferringResponder(reqContext) {

    if (typeof reqContext.playbackResponse !== 'undefined') {
        console.log('|    Playing back recorded response');

        reqContext.flagReplayed = true;
        writeResponseToOutput(reqContext.playbackResponse, reqContext.httpResponse);
        
    }
    else if (typeof reqContext.proxiedResponse !== 'undefined') {
        console.log('|    Returning response from forwarded request');

        reqContext.flagForwarded = true;
        writeResponseToOutput(reqContext.proxiedResponse, reqContext.httpResponse);
        
    }
    
    return reqContext;
    
}

function writeResponseToOutput(response, output) {

    output.writeHead(response.statusCode, response.headers);
    if (response.body) {
        output.write(response.body, function() {
            output.end();
            
        });
    }
    else {
        output.end();
    }

}

