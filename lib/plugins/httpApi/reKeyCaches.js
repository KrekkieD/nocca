'use strict';

var $extend = require('extend');
var $q = require('q');

var $utils = require('../../utils');

module.exports = {
    interface: 'httpApi',
    id: 'reKeyCaches',
    name: 'reKey caches',
    constructor: reKeyCaches
};

function reKeyCaches (Nocca) {

    var self = this;

    self.invoke = invoke;

    function invoke (pluginConfig) {

        self.logger = Nocca.logger.child({ module: module.exports.id });

        // initialize plugin when Nocca says it's ok to do so
        if (!Nocca.initialized) {
            Nocca.pubsub.subscribe(Nocca.constants.PUBSUB_NOCCA_INITIALIZE_PLUGIN, _init);
        }
        else {
            _init();
        }

        return function (reqContext) {
            return delay(reqContext, pluginConfig);
        };

    }

    function _init () {

        // add routes
        var routes = [

            // remove all cacheList sessions
            ['POST:/plugins/reKeyCaches', apiReKeyCaches, 'Returns caches by recreating the requestKey from the clientRequest']
        ];

        routes.forEach(function (routeConfig) {
            Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, routeConfig);
        });

    }

    function apiReKeyCaches (apiReq) {

        $utils.readBody(apiReq.req)
            .then(function (body) {

                body = body.toString();
                var caches = JSON.parse(body);

                if (Array.isArray(caches)) {

                    var startTime = new Date().getTime();

                    // duplicate the options object to prevent manipulation of the main config
                    var options = $extend({}, Nocca.config);


                    var newCachePromises = [];
                    var newCaches = [];

                    caches.forEach(function (cache) {

                        // create a new requestContext so we can use its API
                        var requestContext = Nocca.requestContextFactory.createInstance({
                            url: cache.clientRequest.path
                        }, null);

                        requestContext.setClientRequest(Nocca.httpMessageFactory.createRequest(cache.clientRequest));

                        if (typeof cache.proxyRequest !== 'undefined') {
                            requestContext.setProxyRequest(Nocca.httpMessageFactory.createRequest(cache.proxyRequest));
                        }

                        if (typeof cache.playbackResponse !== 'undefined') {
                            requestContext.setPlaybackResponse(Nocca.httpMessageFactory.createResponse(cache.playbackResponse));
                        }

                        // reserve an index
                        var i = newCaches.push({}) - 1;

                        // re-calculate the endpoint key, may have changed
                        var promise = Nocca.endpointSelector(requestContext)

                            // create a new proxy request
                            .then(Nocca.forwarder.prepareProxyRequest)

                            // actually re-key it
                            .then(requestContext.generateKey)

                            // add to newCaches
                            .then(function (requestContext) {
                                // extract the cache and add to newCaches
                                newCaches[i] = _extractRecording(requestContext);
                                return newCaches[i];
                            });

                        newCachePromises.push(promise);

                    });

                    $q.all(newCachePromises)
                        .then(function () {
                            apiReq.ok().end(newCaches);
                        }, function (err) {
                            apiReq.internalError().end(err);
                        });

                }
                else {

                    apiReq.badRequest().end('Payload should be an array of caches');

                }

            }).fail(function () {

                apiReq.badRequest().end('Unable to read request');

            });

    }

    function _extractRecording (reqContext) {

        var recording = {};

        recording.requestKey = reqContext.requestKey;
        recording.endpointKey = reqContext.endpoint.key;

        // incoming to nocca
        recording.clientRequest = reqContext.getClientRequest().dump();

        // prepared to go out
        recording.proxyRequest = reqContext.getProxyRequest().dump();

        // the response to send back to the client
        recording.playbackResponse = reqContext.getHttpMessage(Nocca.constants.HTTP_MESSAGE_TYPES.PLAYBACK_RESPONSE).dump();

        return recording;

    }


}
