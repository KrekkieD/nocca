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

