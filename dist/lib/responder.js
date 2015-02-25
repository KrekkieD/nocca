'use strict';

module.exports = {};
module.exports.defaultResponder = playbackPreferringResponder;
module.exports.simpleResponder  = playbackPreferringResponder;

function playbackPreferringResponder(reqContext) {

    if (typeof reqContext.playbackResponse !== 'undefined') {
        console.log('|    Playing back recorded response');

        reqContext.flagReplayed = true;
        reqContext.response = reqContext.playbackResponse;

    }
    else if (typeof reqContext.proxiedResponse !== 'undefined') {
        console.log('|    Returning response from forwarded request');

        reqContext.flagForwarded = true;
        reqContext.response = reqContext.proxiedResponse;

    }
    else {
        throw new Error('No data to write to response');
    }

    writeResponseToOutput(reqContext.response, reqContext.httpResponse);


    return reqContext;
    
}

function writeResponseToOutput(response, output) {

    if (response.headers.hasOwnProperty('content-length')) {
        var bodyLength = response.body.length;
        var contentLength = parseInt(response.headers['content-length']);

        if (bodyLength !== contentLength) {
            console.log('|      Content-Length header mismatches actual body size, adjusting header');
            response.headers['content-length'] = bodyLength;
        }
    }

    output.writeHead(response.statusCode, response.headers);
    console.log('|      Status: ' + response.statusCode);
    if (response.body) {
        output.write(response.body, function() {
            output.end();
            
        });
    }
    else {
        output.end();
    }

}

