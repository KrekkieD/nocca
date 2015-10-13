'use strict';

var $q = require('q');
var $extend = require('extend');

module.exports = {
    interface: 'endpointSelector',
    id: 'endpointSelector',
    name: 'Endpoint Selector',
    constructor: EndpointSelector
};

function EndpointSelector (Nocca) {

    var self = this;

    self.logger = Nocca.logger.child({ module: module.exports.id });

    self.invoke = invoke;

    function invoke (pluginConfig) {

        return function (reqContext) {
            return selectEndpoint(reqContext, pluginConfig);
        };

    }

    var DEFAULT_KEY = '_default';

    /**
     * Selects endpoint based on first URL part (i.e. /google/sjampoo -> google)
     */
    function selectEndpoint (reqContext, endpoints) {

        var deferred = $q.defer();

        var req = reqContext.httpRequest;


        var foundEndpoint = _findEndpointByUrl(req.url, endpoints) ||
            _findDefaultEndpoint(req.url, endpoints);

        if (foundEndpoint) {

            reqContext.endpoint = foundEndpoint;

            // extend request config with endpoint config -- allows overwriting EVERYTHING. AHAHAHAHAA
            // not extending deeply to prevent weird configuration merges
            $extend(reqContext.config, reqContext.endpoint.definition);

            self.logger.info('Endpoint key: ' + foundEndpoint.key);

            deferred.resolve(reqContext);

        }
        else {

            self.logger.warn('No cache endpoint found: ' + req.url);
            throw 'Could not find endpoint for ' + req.url;

        }

        return deferred.promise;
    }

    function _findEndpointByUrl (url, endpoints) {

        self.logger.debug('Searching for endpoint');

        var foundEndpoint = false;

        var urlParts = url.split('/');

        // first part is empty, so remove
        urlParts.shift();

        // second part is the cache name
        var cacheName = urlParts.shift();

        if (endpoints.hasOwnProperty(cacheName)) {

            self.logger.debug('Endpoint ' + cacheName + ' found');

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

            self.logger.debug('Endpoint ' + foundEndpoint.key + ' found');

        }

        if (!foundEndpoint) {
            self.logger.warn('No endpoint found for ' + url);
        }

        // we may have something, we may have nothing.
        return foundEndpoint;

    }

    function _findDefaultEndpoint (url, endpoints) {

        if (endpoints.hasOwnProperty(DEFAULT_KEY)) {

            return {
                key: DEFAULT_KEY,

                // remove the first slash of the remaining URL, otherwise
                // the url.resolve will make it root and cancel out any
                // path prefixing that may be present in the endpoint url
                remainingUrl: url.replace(/^\//, ''),
                definition: endpoints[DEFAULT_KEY]
            };
        }
        else {
            return false;
        }

    }

}
