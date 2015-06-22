'use strict';

var $q = require('q');

module.exports = {
    interface: 'cacheExtractor',
    id: 'cacheExtractor',
    name: 'Cache Extractor',
    description: 'Extracts a cache object from a requestContext',
    constructor: CacheExtractor
};


function CacheExtractor () {

    var self = this;

    self.invoke = invoke;

    function invoke (pluginConfig) {

        return function (reqContext) {

            // wrapped in $q.fcall to return a promise, even though it's sync at this time
            return $q.fcall(extractCache, reqContext, pluginConfig);

        };

    }

    function extractCache (reqContext) {

        var playbackResponseHttpMessage = reqContext.getHttpMessage(reqContext.config.recordingSubject);

        return {
            // date of creation of this cache
            cacheTime: new Date().getTime(),

            // this is either roughly the current time if recording new caches,
            // or is inherited from a previously cached response if it's being re-recorded
            playbackTimestamp: playbackResponseHttpMessage.created,

            requestKey: reqContext.requestKey,
            endpointKey: reqContext.endpoint.key,

            // incoming to Nocca
            clientRequest: reqContext.getClientRequest().dump(),

            // prepared to go out, usually the subject used for key generation, so relevant in cache
            proxyRequest: reqContext.getProxyRequest().dump(),

            // the response to send back to the client
            playbackResponse: playbackResponseHttpMessage.dump()
        };

    }

}
