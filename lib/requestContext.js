'use strict';

module.exports = RequestContext;

/**
 *
 * @param httpRequest the original HTTP Request coming into the server.
 * @param httpResponse the original HTTP Response going back to the client.
 * @param startTime the timestamp when this request context started processing.
 * @param options a copy of the configuration of Nocca (TODO: share a frozen copy between requests instead of new object).
 * @constructor constructs a new RequestContext which will be passed along the request throughout the etinre handler chain.
 */
function RequestContext(httpRequest, httpResponse, startTime, options) {

    this.httpRequest = httpRequest;
    this.httpResponse = httpResponse;

    this.requestStartTime = startTime;
    this.options = options;

    /**
     * The first step in any chain builder should be to collect information from the HTTP request and create the request
     * object. It MUST contain the following properties after it passed through:
     *  * url
     *  * method
     *  * path
     *  * headers
     *  * body
     * @type {undefined}
     */
    this.request = undefined;

    /**
     * An implementation of an EndpointSelector must fill the endpoint property with the matched endpoint definition.
     * @type {undefined}
     */
    this.endpoint = undefined;

    /**
     * An implementation of a KeyGenerator must fill the requestKey property with a string which identifies the incoming
     * request.
     * @type {undefined}
     */
    this.requestKey = undefined;

    /**
     * An implementation of a RequestMatcher may fill in the playbackResponse property if it has determined a recorded
     * response should be returned to the client.
     * @type {undefined}
     */
    this.playbackResponse = undefined;

    /**
     * An implementation of a RequestForwarder must fill the proxiedFlatRequest property with a copy of the request
     * object, adjusted for sending to the target server.
     * @type {undefined}
     */
    this.proxiedFlatRequest = undefined;

    /**
     * An implementation of a RequestForwarder must fill the proxiedRequest property with the object created by the
     * http.request method for the forwarded call.
     * @type {undefined}
     */
    this.proxiedRequest = undefined;

    /**
     * An implementation of a RequestForwarder must fill the proxiedResponse property with the received response object.
     * @type {undefined}
     */
    this.proxiedResponse = undefined;

    /**
     * Any component along the way may fill the statusCode, errorCode and errorMessage fields to indicate the request
     * could not be completed. Providing these will override returning any forwarded or pre-recorded response and will
     * write a response based on these properties.
     * @type {undefined}
     */
    this.statusCode = undefined;

    /**
     * Any component along the way may fill the statusCode, errorCode and errorMessage fields to indicate the request
     * could not be completed. Providing these will override returning any forwarded or pre-recorded response and will
     * write a response based on these properties.
     * @type {undefined}
     */
    this.errorCode = undefined;

    /**
     * Any component along the way may fill the statusCode, errorCode and errorMessage fields to indicate the request
     * could not be completed. Providing these will override returning any forwarded or pre-recorded response and will
     * write a response based on these properties.
     * @type {undefined}
     */
    this.errorMessage = undefined;

    this.error = undefined;
    this.cause = undefined;

}
