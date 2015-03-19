'use strict';

module.exports = patchResponses;

/**
 * Transforms a Responses object of a Scenario to the newer version containing HttpMessage objects.
 *
 * @param responses a Responses object serialized by the initial Scenario recorder.
 * @returns {{}} a Responses object with the responses transformed to containing an HttpMessage object.
 */
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