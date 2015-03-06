'use strict';

module.exports = RequestContext;

/**
 *
 * @param httpRequest
 * @param httpResponse
 * @param startTime
 * @param options
 * @constructor
 */
function RequestContext(httpRequest, httpResponse, startTime, options) {

    this.httpRequest = httpRequest;
    this.httpResponse = httpResponse;

    this.requestStartTime = startTime;
    this.options = options;

    this.request = undefined;
    this.endpoint = undefined;
    this.requestKey = undefined;
    this.playbackResponse = undefined;
    
    this.proxiedFlatRequest = undefined;
    this.proxiedRequest = undefined;
    this.proxiedResponse = undefined;
    
    this.statusCode = undefined;
    this.errorCode = undefined;
    this.errorMessage = undefined;
    this.error = undefined;
    this.cause = undefined;

}
