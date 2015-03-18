'use strict';

module.exports = patchResponses;


function patchResponses (responses) {

    var newResponses = {};
    Object.keys(responses).forEach(function (key) {

        var response = responses[key];
        var newResponse = {};

        newResponse.requestKey = response.requestKey;

        newResponse.playbackResponse = {
            type: 'RESPONSE'
        };
        response.statusCode && (newResponse.playbackResponse.statusCode = response.statusCode);
        response.statusMessage && (newResponse.playbackResponse.statusMessage = response.statusMessage);
        response.headers && (newResponse.playbackResponse.headers = response.headers);
        response.body && (newResponse.playbackResponse.body = response.body);

        newResponses[key] = newResponse;

    });

    return newResponses;

}