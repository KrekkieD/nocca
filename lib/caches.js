'use strict';

var $q = require('q');
var $extend = require('extend');

module.exports = {};
module.exports.defaultCacheSelector = firstUrlPartCacheSelector;
module.exports.firstUrlPartCacheSelector = firstUrlPartCacheSelector;
module.exports.newEndpoint = addCacheEndpoint;


var endpoints = {};

// config = {
//   targetBaseUrl: '', // Full URL to forward to. Note that the part after the cache name will be appended to this URL
//   keyGenerator: undefined, // Allows for overriding the default key generator for each endpoint
// }
function addCacheEndpoint(name, config) {
    if (!config.targetBaseUrl) { 
        console.log('|  Warning! Endpoint with key "' + name + '" has not targetBaseUrl property and cannot be used for forwarding/recording. ');
    }
    
    endpoints[name] = $extend({
        statistics: {
            requests: 0,
            hits: 0,
            misses: 0
        }
    }, config);

}

function firstUrlPartCacheSelector(reqContext) {

    var d = $q.defer();

    var cacheName = firstUrlPart(reqContext.request.url);

    if (endpoints.hasOwnProperty(cacheName)) {
        endpoints[cacheName].statistics.requests++;

        reqContext.endpoint = {
            key: cacheName,
            remainingUrl: remainingUrlAfterCacheKey(reqContext.request.url, cacheName),
            definition: endpoints[cacheName]
        };

        d.resolve(reqContext);
        console.log('|    Selected cache endpoint: ' + cacheName);
    }
    else {
        reqContext.error = 'No matching endpoint found';
        reqContext.statusCode = 404;

        console.log('|    No cache endpoint found: ' + cacheName);

        d.reject( reqContext );
    }

    return d.promise;
}

function firstUrlPart(url) {
    return (url) ? url.split('/')[1] : undefined;
}

function remainingUrlAfterCacheKey(url, cacheKey) {
    return url.substring(cacheKey.length + 2);
}


