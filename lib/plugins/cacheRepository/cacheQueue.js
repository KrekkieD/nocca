'use strict';

var $utils = require('../../utils');

module.exports = {
    interface: 'cacheRepository',
    id: 'cacheQueue',
    name: 'Cache Queue Repository',
    description: 'Ordered list of caches, selects first matching cache entry for playback, removes cache entry on hit, allows skipping caches',
    constructor: CacheQueue
};

function CacheQueue (Nocca) {

    var caches = {
        cacheKeys: {},
        caches: {}
    };
    var cacheLists = {};

    var recordedCaches = [];

    var self = this;

    self.logger = Nocca.logger.child({ module: module.exports.id });

    var parentLogger = self.logger;

    self.invoke = invoke;

    self.setCaches = setCaches;
    self.considerRecording = considerRecording;
    self.matchRequest = matchRequest;

    // initialize plugin when Nocca says it's ok to do so
    if (!Nocca.initialized) {
        Nocca.pubsub.subscribe(Nocca.constants.PUBSUB_NOCCA_INITIALIZE_PLUGIN, _init);
    }
    else {
        _init();
    }

    // listen for publications with caches
    Nocca.pubsub.subscribe('CACHE_QUEUE_SET_CACHES', self.setCaches);

    function invoke () {

        return self;

    }

    function _init () {

        // add routes
        var routes = [

            // remove all cacheList sessions
            ['DELETE:/plugins/cacheQueue/caches', apiDeleteCaches, 'Empties playback caches'],

            // feed caches
            ['PUT:/plugins/cacheQueue/caches', apiSetCaches, 'Replace playback caches (expects array of caches)'],

            // feed caches
            ['GET:/plugins/cacheQueue/caches', apiGetCaches, 'Get current state of playback caches'],

            // export recorded caches
            ['GET:/plugins/cacheQueue/recorded-caches', apiGetRecordedCaches, 'Get contents of current recording session']
        ];

        routes.forEach(function (routeConfig) {
            Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, routeConfig);
        });

    }

    function setCaches (cacheArray) {

        if (typeof cacheArray === 'string') {
            // try json parsing it
            cacheArray = JSON.parse(cacheArray);
        }

        if (Array.isArray(cacheArray)) {

            // redefining caches means removing all cacheLists, so do that first
            Object.keys(cacheLists).forEach(function (sessionId) {
                delete cacheLists[sessionId];
            });

            // also reset the current caches obj
            caches = {
                cacheKeys: {},
                caches: {}
            };

            // then parse and reassign caches
            cacheArray.forEach(function (cache) {

                var cacheKey = generateCacheQueueKey(cache.endpointKey, cache.requestKey);

                // register cacheKey if not yet registered
                caches.cacheKeys[cacheKey] = caches.cacheKeys[cacheKey] || 0;

                // and increment count to indicate cache length
                caches.cacheKeys[cacheKey]++;

                // register the cache using a numbered cacheKey
                var numberedCacheKey = cacheKey + '#' + caches.cacheKeys[cacheKey];
                caches.caches[numberedCacheKey] = cache;

            });

            self.logger.info('Cache queue filled with ' + cacheArray.length + ' caches');

        }
        else {
            throw 'setCaches() should be called with an array, got ' + (typeof cacheArray);
        }

    }

    function considerRecording (reqContext) {

        // reserve a spot in the caches
        var i = recordedCaches.push({}) - 1;

        // always recording, so always extracting the cache
        return Nocca.usePlugin(reqContext.config.cacheExtractor)(reqContext)
            .then(function (cache) {

                self.logger.info('Recorded cache');

                // fill reserved spot
                recordedCaches[i] = cache;

                return reqContext;

            });

    }

    function matchRequest (reqContext) {

        // get a relevant cacheList
        var cacheList = _getCacheList(reqContext);

        // get and consume a cache from the list, if present
        var cache = cacheList.consume(reqContext);

        // when found, parse to httpMessage format
        if (typeof cache !== 'undefined') {

            self.logger.info('<<<< Providing cache response');

            cache = Nocca.httpMessageFactory.createResponse(cache.playbackResponse);
        }

        return cache;

    }

    function _getCacheList (reqContext) {

        // allows session dedicated cache list to support loadTesting
        var sessionId = '_default';

        if (typeof reqContext.config.sessionId !== 'undefined') {
            sessionId = reqContext.config.sessionId;
        }

        // see if sessionId already has a dedicated cacheList
        if (typeof cacheLists[sessionId] === 'undefined') {
            // no cacheList present, generate on the fly
            cacheLists[sessionId] = new CacheList(caches);
        }

        return cacheLists[sessionId];

    }

    function generateCacheQueueKey (endpointKey, requestKey) {

        return endpointKey + '' + requestKey;

    }

    function CacheList (caches) {

        var self = this;

        self.empty = false;
        self.repository = {
            cacheKeys: {},
            steps: {},
            caches: {},
            hits: 0
        };

        self.consume = consume;

        // parse caches
        Object.keys(caches.caches).forEach(function (numberedCacheKey) {
            // copy a reference to the actual cache so we can call 'delete' on our object without manipulating the original
            self.repository.caches[numberedCacheKey] = caches.caches[numberedCacheKey];
            self.repository.steps[numberedCacheKey] = false;
        });

        function consume (reqContext) {

            var cache;

            var cacheKey = generateCacheQueueKey(reqContext.endpoint.key, reqContext.requestKey);

            // increment count of cacheKey
            self.repository.cacheKeys[cacheKey] = self.repository.cacheKeys[cacheKey] || 0;
            self.repository.cacheKeys[cacheKey]++;

            var numberedCacheKey = cacheKey + '#' + self.repository.cacheKeys[cacheKey];

            if (typeof self.repository.caches[numberedCacheKey] !== 'undefined') {

                // hit!
                self.repository.hits++;

                // assign cache
                cache = self.repository.caches[numberedCacheKey];

                // mark step as hit with hit count
                self.repository.steps[numberedCacheKey] = self.repository.hits;

                // consume from queue
                delete self.repository.caches[numberedCacheKey];

                self.empty = Object.keys(self.repository.caches).length === 0;

                if (self.empty) {
                    parentLogger.info('All caches in CacheQueue repository were hit! No caches remaining.');
                }
                else {

                    // show progress
                    var progress = [];
                    var hits = 0;
                    Object.keys(self.repository.steps).forEach(function (hit) {

                        if (self.repository.steps[hit]) {
                            hits++;
                        }

                        progress.push(self.repository.steps[hit] ? '+' : '-');
                    });

                    var hitPercentage = 0;
                    if (hits) {
                        hitPercentage = Math.round(hits / progress.length * 100);
                    }

                    hitPercentage = ('   ' + hitPercentage).substr(-3) + '% ';

                    parentLogger.info(hitPercentage + progress.join('|'));

                }
            }

            return cache;

        }

    }


    // R E S T - A P I   F U N C T I O N A L I T Y

    function apiGetRecordedCaches (apiReq) {

        apiReq.ok().end(recordedCaches);

    }

    function apiSetCaches (apiReq) {

        $utils.readBody(apiReq.req)
            .then(function (body) {

                var newCaches = JSON.parse(body);

                if (Array.isArray(newCaches)) {

                    self.setCaches(newCaches);
                    apiReq.ok().end(caches);

                }
                else {

                    apiReq.badRequest().end('Payload should be an array of caches');

                }

            }).fail(function () {

                apiReq.badRequest().end('Unable to read request');

            });

    }

    function apiGetCaches (apiReq) {

        apiReq.ok().end(cacheLists);

    }

    function apiDeleteCaches (apiReq) {

        setCaches([]);
        apiReq.ok().end(caches);

    }

}
