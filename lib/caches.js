'use strict';

var $q = require('q');
var $extend = require('extend');

module.exports = Caches;

function Caches (Nocca) {

    var self = this;

    self.addCacheEndpoints = addCacheEndpoints;
    self.cacheSelector = firstUrlPartCacheSelector;

    var endpoints = {};


    function addCacheEndpoints (endpoints) {

        // iterate over object
        Object.keys(endpoints).forEach(function (key) {
            _addCacheEndpoint(key, endpoints[key]);
        });

    }

    // config = {
    //   targetBaseUrl: '', // Full URL to forward to. Note that the part after the cache name will be appended to this URL
    //   keyGenerator: undefined, // Allows for overriding the default key generator for each endpoint
    // }
    function _addCacheEndpoint(name, config) {

        if (!config.targetBaseUrl) {
            Nocca.logWarning('Warning! Endpoint with key "' + name + '" has not targetBaseUrl property and cannot be used for forwarding/recording. ');
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

        var urlParts = reqContext.request.url.split('/');

        // first part is empty, so remove
        urlParts.shift();

        // second part is the cache name
        var cacheName = urlParts.shift();

        if (endpoints.hasOwnProperty(cacheName)) {
            endpoints[cacheName].statistics.requests++;

            reqContext.endpoint = {
                key: cacheName,
                remainingUrl: urlParts.join('/'),
                definition: endpoints[cacheName]
            };

            d.resolve(reqContext);
            Nocca.logInfo('Selected cache endpoint: ' + cacheName);
        }
        else {
            reqContext.error = 'No matching endpoint found';
            reqContext.statusCode = 404;

            Nocca.logWarning('No cache endpoint found: ' + cacheName);

            d.reject( reqContext );
        }

        return d.promise;
    }

}
