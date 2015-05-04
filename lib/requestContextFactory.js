'use strict';

var $extend = require('extend');
var $q = require('q');

module.exports = requestContextFactory;

function requestContextFactory (Nocca) {

    this.createInstance = createInstance;


    function createInstance (httpRequest, httpResponse) {

        var startTime = new Date().getTime();

        // duplicate the options object to prevent manipulation of the main config
        var options = $extend({}, Nocca.config);

        return new RequestContext(httpRequest, httpResponse, startTime, options);
    }

    /**
     *
     * @param httpRequest the original HTTP Request coming into the server.
     * @param httpResponse the original HTTP Response going back to the client.
     * @param startTime the timestamp when this request context started processing.
     * @param config a copy of the configuration of Nocca (TODO: share a frozen copy between requests instead of new object).
     * @constructor constructs a new RequestContext which will be passed along the request throughout the etinre handler chain.
     */
    function RequestContext(httpRequest, httpResponse, startTime, config) {

        var self = this;

        this.start = start;

        // getters and setters so actual property doesn't matter
        this.getHttpMessage = getHttpMessage;
        this.setClientRequest = setClientRequest;
        this.getClientRequest = getClientRequest;
        this.setPlaybackResponse = setPlaybackResponse;
        this.getPlaybackResponse = getPlaybackResponse;
        this.setProxyRequest = setProxyRequest;
        this.getProxyRequest = getProxyRequest;
        this.setProxyResponse = setProxyResponse;
        this.getProxyResponse = getProxyResponse;
        this.setClientResponse = setClientResponse;
        this.getClientResponse = getClientResponse;

        this.generateKey = generateKey;
        this.replayIfDesired = replayIfDesired;
        this.forwardIfDesired = forwardIfDesired;
        this.recordIfDesired = recordIfDesired;

        this.requests = {
            // as received by Nocca || incoming request
            clientReq: undefined,
            // as sent to endpoint by Nocca || outgoing request
            proxyReq: undefined,
            // as received by Nocca from endpoint || incoming response
            proxyRes: undefined,
            // as gathered from cache by Nocca || incoming (prerecorded) response
            playbackRes: undefined,
            // as provided to Nocca by Node from client || outgoing response
            clientRes: undefined
        };

        this.httpRequest = httpRequest;
        this.httpResponse = httpResponse;

        this.requestStartTime = startTime;
        this.config = config;

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


        function start () {

            var deferred = $q.defer();

            // Allow the request chainer to set up a promise chain
            var chain = Nocca.requestChainer(deferred.promise, self);

            // TODO: make sure thrown errors are handled properly
            chain.catch(Nocca.errorHandler.chainError(self.httpResponse));

            // Resolve the initial promise to kick off the chain
            deferred.resolve(self);

        }

        function getHttpMessage (httpMessageKey) {

            var httpMessage;

            switch (httpMessageKey) {
                case Nocca.constants.HTTP_MESSAGE_TYPES.CLIENT_REQUEST:

                    httpMessage = self.getClientRequest();

                    break;
                case Nocca.constants.HTTP_MESSAGE_TYPES.PROXY_REQUEST:

                    httpMessage = self.getProxyRequest();

                    break;
                case Nocca.constants.HTTP_MESSAGE_TYPES.PROXY_RESPONSE:

                    httpMessage = self.getProxyResponse();

                    break;
                case Nocca.constants.HTTP_MESSAGE_TYPES.PLAYBACK_RESPONSE:

                    httpMessage = self.getPlaybackResponse();

                    break;
                case Nocca.constants.HTTP_MESSAGE_TYPES.CLIENT_RESPONSE:

                    httpMessage = self.getClientResponse();

                    break;
                default:
                    throw 'Unknown message type: ' + httpMessageKey;
                    break;
            }

            return httpMessage;

        }

        function setClientRequest (HttpMessage) {
            self.requests.clientReq = HttpMessage;
        }
        function getClientRequest () {
            return self.requests.clientReq;
        }
        function setPlaybackResponse (HttpMessage) {
            self.requests.playbackRes = HttpMessage;
        }
        function getPlaybackResponse () {
            return self.requests.playbackRes;
        }
        function setProxyRequest (HttpMessage) {
            self.requests.proxyReq = HttpMessage;
        }
        function getProxyRequest () {
            return self.requests.proxyReq;
        }
        function setProxyResponse (HttpMessage) {
            self.requests.proxyRes = HttpMessage;
        }
        function getProxyResponse () {
            return self.requests.proxyRes;
        }
        function setClientResponse (HttpMessage) {
            self.requests.clientRes = HttpMessage;
        }
        function getClientResponse () {
            return self.requests.clientRes;
        }

        function generateKey (reqContext) {

            return Nocca.usePlugin(reqContext.config.keyGenerator)
                .generateKey(reqContext);

        }

        function replayIfDesired (reqContext) {

            var deferred = $q.defer();

            if (reqContext.config.forward === Nocca.constants.FORWARDING_FORWARD_NONE ||
                reqContext.config.forward === Nocca.constants.FORWARDING_FORWARD_MISSING) {

                // Either forwarding is off altogether, or set to forward MISSING requests only.
                // We will try to find a matching request to respond with
                deferred.resolve(Nocca.playback.findMatchingRequest(reqContext));

            }
            else {
                deferred.resolve(reqContext);
            }

            return deferred.promise;

        }

        function forwardIfDesired (reqContext) {

            var deferred = $q.defer();

            if (reqContext.config.forward === Nocca.constants.FORWARDING_FORWARD_ALL ||
                reqContext.config.forward === Nocca.constants.FORWARDING_FORWARD_MISSING) {

                // Forwarding is on, either for all requests, or just MISSING requests.
                deferred.resolve(Nocca.forwarder(reqContext));
            }
            else {
                deferred.resolve(reqContext);
            }

            return deferred.promise;

        }

        function recordIfDesired (reqContext) {

            var deferred = $q.defer();

            if (reqContext.config.record) {
                deferred.resolve(Nocca.recorder(reqContext));
            }
            else {
                deferred.resolve(reqContext);
            }

            return deferred.promise;

        }

    }


}

