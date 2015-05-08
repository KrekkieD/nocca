'use strict';

var $q = require('q');
var $extend = require('extend');

module.exports = Endpoints;

function Endpoints (Nocca) {

    var self = this;

    self.addEndpoints = addEndpoints;
    self.endpointSelector = endpointSelector;

    var DEFAULT_KEY = '_default';

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

        var deferred = $q.defer();

        var req = reqContext.getClientRequest();

        var foundEndpoint = _findEndpointByUrl(req.path) ||
            _findDefaultEndpoint(req.path);

        if (foundEndpoint) {

            endpoints[foundEndpoint.key].statistics.requests++;
            reqContext.endpoint = foundEndpoint;

            // extend request config with endpoint config -- allows overwriting EVERYTHING. AHAHAHAHAA
            $extend(reqContext.config, reqContext.endpoint.definition);

            Nocca.logInfo('Selected cache endpoint: ' + foundEndpoint.key);

            deferred.resolve(reqContext);

        }
        else {
            reqContext.errorCode = Nocca.constants.ERRORS.NO_ENDPOINT_FOUND;
            reqContext.errorMessage = 'Could not find endpoint for ' + req.path;
            reqContext.statusCode = 404;

            reqContext.endpoint = {
                key: 'unknown: ' + req.path,
                remainingUrl: req.path
            };

            Nocca.logWarning('No cache endpoint found: ' + req.path);

            deferred.reject(reqContext);
        }

        return deferred.promise;
    }

    function _findEndpointByUrl (url) {

        Nocca.logDebug('Searching for endpoint');

        var foundEndpoint = false;

        var urlParts = url.split('/');

        // first part is empty, so remove
        urlParts.shift();

        // second part is the cache name
        var cacheName = urlParts.shift();

        if (endpoints.hasOwnProperty(cacheName)) {

            Nocca.logDebug('Endpoint ' + cacheName + ' found');

            foundEndpoint = {
                key: cacheName,
                remainingUrl: urlParts.join('/'),
                definition: endpoints[cacheName]
            };
        }
        else {

            var matchLength = 0;
            // do indexOf matching on start of the URL, take longest match
            Object.keys(endpoints).forEach(function (endpoint) {

                if (url.indexOf(endpoint) === 0 && endpoint.length > matchLength) {
                    // new longer match! remember
                    foundEndpoint = {
                        key: endpoint,
                        remainingUrl: url.substring(endpoint.length),
                        definition: endpoints[endpoint]
                    };

                    matchLength = endpoint.length;
                }

            });

            Nocca.logDebug('Endpoint ' + foundEndpoint.key + ' found');

        }

        if (!foundEndpoint) {
            Nocca.logWarning('No endpoint found for ' + url);
        }

        // we may have something, we may have nothing.
        return foundEndpoint;

    }

    function _findDefaultEndpoint (url) {

        if (endpoints.hasOwnProperty(DEFAULT_KEY)) {

            return {
                key: DEFAULT_KEY,
				// remove the first slash of the remaining URL, otherwise
				// the url.resolve will make it root and cancel out any
				// path prefixing that may be present in the endpoint url
                remainingUrl: url.replace(/^\//,''),
                definition: endpoints[DEFAULT_KEY]
            };
        }
        else {
            return false;
        }

    }

}
