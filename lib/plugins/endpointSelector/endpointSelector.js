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

    var DEFAULT_KEY = '_default';
    var PARAM_REGEX = /:[a-zA-Z_-]+/g;

    function invoke (pluginConfig) {

        return function (reqContext) {
            return selectEndpoint(reqContext, pluginConfig);
        };

    }


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

            self.logger.error('No cache endpoint found: ' + req.url);

            reqContext.errors.throwNoEndpointError();

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

        // superfast check by searching the very first 'folder' part of the url as endpoint key
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

                var matchedAndLonger = url.indexOf(endpoint) === 0 && endpoint.length > matchLength;
                var matchedRegex = !matchedAndLonger && _matchRegexEndpoint(url, endpoint);

                if (matchedAndLonger || matchedRegex) {

                    // new longer match! remember
                    foundEndpoint = {
                        key: endpoint,
                        remainingUrl: url.substring(matchedRegex ? matchedRegex.urlPart.length : endpoint.length),
                        definition: endpoints[endpoint],
                        params: matchedRegex
                    };

                    matchLength = endpoint.length;
                }

            });

            self.logger.debug('Endpoint ' + foundEndpoint.key + ' found');

        }

        // we may have something, we may have nothing.
        return foundEndpoint;

    }

    function _matchRegexEndpoint (url, endpointKey) {

        var params = endpointKey.match(PARAM_REGEX);

        var matches = null;

        if (params !== null) {

            var regexEndpointKey = _escapeRegExp(endpointKey);
            params.forEach(function (param) {
                regexEndpointKey = regexEndpointKey.replace(param, '([^/]+)');
            });

            var regexMatches = url.match(regexEndpointKey);

            if (regexMatches) {
                // parse matches to object

                // remove first index, which is the full string
                matches = {
                    urlPart: regexMatches.shift()
                };

                params.forEach(function (param, index) {

                    // remove the colon from the param
                    param = param.substr(1);

                    matches[param] = regexMatches[index];

                });

            }

        }

        return matches;

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

    function _escapeRegExp (str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }

}
