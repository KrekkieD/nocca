'use strict';

var $extend = require('extend');

var $utils = require('../utils');

module.exports = {
    interface: 'cacheRepository',
    id: 'cacheConglomerate',
    name: 'Cache Conglomerate Repository',
    description: 'The gotta-cache-em-all solution, creates one big pile-o-caches',
    constructor: cacheConglomerate
};

function cacheConglomerate (Nocca) {

    var caches = {};
    var recordedCaches = [];

    var self = this;

    // TODO: why is the name required for playback?
    self.name = function () {
        return module.exports.name;
    };

    self.setCaches = setCaches;
    self.considerRecording = considerRecording;
    self.matchRequest = matchRequest;

    // initialize plugin when Nocca says it's ok to do so
    Nocca.pubsub.subscribe(Nocca.constants.PUBSUB_NOCCA_INITIALIZE_PLUGIN, _init);

    // listen for publications with caches
    Nocca.pubsub.subscribe('CACHE_CONGLOMERATE_SET_CACHES', self.setCaches);

    function _init () {

        // add routes
        var routes = [
            // replace caches
            ['GET:/plugins/cacheConglomerate/caches', apiGetCaches],

            // remove all cacheList sessions
            ['DELETE:/plugins/cacheConglomerate/caches', apiDeleteCaches],

            // add caches
            ['POST:/plugins/cacheConglomerate/caches', apiAddCaches],

            // replace caches
            ['PUT:/plugins/cacheConglomerate/caches', apiReplaceCaches],

            // export recorded caches
            ['GET:/plugins/cacheConglomerate/recorded-caches', apiGetRecordedCaches]
        ];

        routes.forEach(function (routeConfig) {
            Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, routeConfig);
        });

    }


    function getCaches () {

        var cacheSnapshot = [];

        Object.keys(caches).forEach(function (cacheKey) {

            cacheSnapshot.push(caches[cacheKey]);

        });

        return cacheSnapshot;

    }

    function setCaches (cacheArray) {

        if (typeof cacheArray === 'string') {
            // try json parsing it
            cacheArray = JSON.parse(cacheArray);
        }

        if (Array.isArray(cacheArray)) {

            Nocca.logInfo('Adding caches with length of ' + cacheArray.length);

            // then parse and reassign caches
            cacheArray.forEach(function (cache) {

                var cacheKey = generateCacheQueueKey(cache.endpointKey, cache.requestKey);

                if (typeof caches[cacheKey] !== 'undefined') {
                    // overwriting cache! should warn
                    Nocca.logWarning('Cache Conglomerate has a double cache entry, overwriting old cache. Key: ' + cacheKey);
                }
                // use cacheKey to assign cache
                caches[cacheKey] = cache;

            });

        }
        else {
            throw 'setCaches() should be called with an array, got ' + (typeof cacheArray);
        }

    }

    function clearCaches () {

        Object.keys(caches).forEach(function (cacheKey) {
            delete caches[cacheKey];
        });

    }

    function considerRecording (reqContext) {

        var recorded = false;

        // always record for now
        var recording = _extractRecording(reqContext);

        if (recording) {
            recordedCaches.push(recording);

            recorded = true;
        }

        return recorded;

    }

    function matchRequest (reqContext) {

        var cacheKey = generateCacheQueueKey(reqContext.endpoint.key, reqContext.requestKey);

        var cache;

        // when found, parse to httpMessage format
        if (typeof caches[cacheKey] !== 'undefined') {
            cache = Nocca.httpMessageFactory.createResponse(caches[cacheKey].playbackResponse);
        }

        return cache;

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
        recording.playbackResponse = reqContext.getHttpMessage(reqContext.config.recordingSubject).dump();

        return recording;

    }

    function generateCacheQueueKey (endpointKey, requestKey) {

        return endpointKey + '' + requestKey;

    }


    // R E S T - A P I   F U N C T I O N A L I T Y

    function apiGetRecordedCaches (apiReq) {

        apiReq.ok().end(recordedCaches);

    }

    function apiGetCaches (apiReq) {

        apiReq.ok().end(getCaches());

    }

    function apiAddCaches (apiReq) {

        $utils.readBody(apiReq.req)
            .then(function(body) {

                var newCaches = JSON.parse(body);

                if (Array.isArray(newCaches)) {

                    setCaches(newCaches);
                    apiReq.ok().end(getCaches());

                }
                else {

                    apiReq.badRequest().end('Payload should be an array of caches');

                }

            }).fail(function() {

                apiReq.badRequest().end('Unable to read request');

            });

    }

    function apiReplaceCaches (apiReq) {

        $utils.readBody(apiReq.req)
            .then(function(body) {

                var newCaches = JSON.parse(body);

                if (Array.isArray(newCaches)) {

                    clearCaches();
                    setCaches(newCaches);

                    apiReq.ok().end(getCaches());

                }
                else {

                    apiReq.badRequest().end('Payload should be an array of caches');

                }

            }).fail(function() {

                apiReq.badRequest().end('Unable to read request');

            });

    }

    function apiDeleteCaches (apiReq) {

        clearCaches();
        apiReq.ok().end(getCaches());

    }

}