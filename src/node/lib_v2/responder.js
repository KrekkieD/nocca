'use strict';

module.exports = {};
module.exports.defaultResponder = playbackPreferringResponder;
module.exports.simpleResponder  = playbackPreferringResponder;

var $q = require('q');

function playbackPreferringResponder(reqContext) {
    

    if (reqContext.playbackResponse) {
        console.log('|    Playing back recorded response');

        reqContext.flagReplayed = true;
        writeResponseToOutput(reqContext.playbackResponse, reqContext.httpResponse);
        
    }
    else if (reqContext.proxiedResponse) {
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

