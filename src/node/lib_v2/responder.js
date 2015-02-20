'use strict';

module.exports = {};
module.exports.defaultResponder = playbackPreferringResponder;
module.exports.simpleResponder  = playbackPreferringResponder;

var $q = require('q');

function playbackPreferringResponder(reqContext) {
    

    if (reqContext.playbackResponse) {
        console.log('|    Playing back recorded response');

        writeResponseToOutput(reqContext.playbackResponse, reqContext.httpResponse);
        
    }
    else if (reqContext.proxiedResponse) {
        console.log('|    Returning response from forwarded request');
        
        writeResponseToOutput(reqContext.proxiedResponse, reqContext.httpResponse);
        
    }
    
    return reqContext;
    
}

function writeResponseToOutput(response, output) {

    output.writeHead(response.statusCode, response.headers);
    if (response.data) {
        output.write(response.data);
    }
    output.end();

}

