'use strict';

module.exports = RequestContext;


function RequestContext(request, httpResponse, startTime, options) {
    this.request = request;
    this.httpResponse = httpResponse;
    this.requestStartTime = startTime;
    this.options = options;

    this.request = null;
    this.endpoint = null;
    this.requestKey = null;
    this.playbackResponse = null;
    
    this.proxiedFlatRequest = null;
    this.proxiedRequest = null;
    this.proxiedResponse = null;
    
    this.statusCode = null;
    this.error = null;
    this.cause = null;
}
