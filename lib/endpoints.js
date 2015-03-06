'use strict';

var $q = require('q');
var $extend = require('extend');

module.exports = Endpoints;

function Endpoints (Nocca) {

    var self = this;

    self.addEndpoints = addEndpoints;
    self.endpointSelector = endpointSelector;

    var endpoints = {};


    function addEndpoints (endpoints) {

        // iterate over object
        Object.keys(endpoints).forEach(function (key) {
            _addEndpoint(key, endpoints[key]);
        });

    }

    // config = {
    //   targetBaseUrl: '', // Full URL to forward to. Note that the part after the cache name will be appended to this URL
    //   keyGenerator: undefined, // Allows for overriding the default key generator for each endpoint
    // }
    function _addEndpoint(name, config) {

        if (!config.targetBaseUrl) {
            Nocca.logWarning('Warning! Endpoint with key "' + name + '" has no targetBaseUrl property and cannot be used for forwarding/recording. ');
        }

        endpoints[name] = $extend({
            statistics: {
                requests: 0,
                hits: 0,
                misses: 0
            }
        }, config);

    }

    /**
     * Selects endpoint based on first URL part (i.e. /google/sjampoo -> google)
     */
    function endpointSelector (reqContext) {

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
            reqContext.error = 'No matching endpoint found for: ' + cacheName;
            reqContext.statusCode = 404;

            reqContext.endpoint = {
                key: 'none',
                remainingUrl: urlParts.join('/')
            };

            Nocca.logWarning('No cache endpoint found: ' + cacheName);

            d.reject( reqContext );
        }

        return d.promise;
    }

}
