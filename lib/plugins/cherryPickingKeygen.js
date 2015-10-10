'use strict';

var $utils = require(__dirname + '/../utils');

var $q = require('q');
var $xpath = require('xpath.js');
var $xmldom = require('xmldom');

var $url = require('url');

module.exports = {
    interface: 'keyGenerator',
    id: 'cherryPickingKeygen',
    name: 'Cherry Picking Key Generator',
    constructor: CherryPickingKeygen
};

function CherryPickingKeygen (Nocca) {

    var self = this;

    self.logger = Nocca.logger.child({ module: module.exports.id });

    self.invoke = invoke;

    self.requestToKey = requestToKey;

    function invoke (pluginConfig) {

        return function (reqContext) {
            return generateKey(reqContext, pluginConfig);
        };

    }

    function generateKey (reqContext, pluginConfig) {

        var deferred = $q.defer();

        var requestKeyParam = pluginConfig || {
            properties: ['path', 'method'],
            url: ['pathname'],
            headers: ['accept', 'content-type']
        };

        // specify subject on which to generate the key
        var req = reqContext.getProxyRequest().dump();
        if (typeof requestKeyParam.subject !== 'undefined') {

            req = reqContext.getHttpMessage(requestKeyParam.subject).dump();
        }

        reqContext.requestKey = requestToKey(req, requestKeyParam);

        deferred.resolve(reqContext);

        return deferred.promise;

    }

    function requestToKey (req, requestKeyParam) {

        var requestKey = {};

        if (typeof requestKeyParam.properties !== 'undefined') {

            // extract simple properties of the req object
            var properties = extractProperties(req, requestKeyParam.properties);
            properties && (requestKey.properties = properties);

        }


        if (typeof requestKeyParam.url !== 'undefined') {

            // parsing path query params
            var urlParts = extractUrlParts(req, requestKeyParam.url);
            urlParts && (requestKey.url = urlParts);

        }


        if (typeof requestKeyParam.query !== 'undefined') {

            // parsing path query params
            var queryParams = extractQuery(req, requestKeyParam.query);
            queryParams && (requestKey.query = queryParams);

        }


        if (typeof requestKeyParam.headers !== 'undefined') {

            // parsing headers, should be an array, simply fetch and add
            var headers = extractHeaders(req, requestKeyParam.headers);
            headers && (requestKey.headers = headers);

        }

        if (typeof requestKeyParam.fixed !== 'undefined') {

            // fixed key values, simply add to key
            requestKey.fixed = requestKeyParam.fixed;

        }

        if (typeof requestKeyParam.body !== 'undefined' &&
            typeof requestKeyParam.body.xpath !== 'undefined') {

            // xpath querying!
            var xpathNodes = extractXpath(req, requestKeyParam.body.xpath);
            if (typeof xpathNodes !== 'undefined') {
                requestKey.body = requestKey.body || {};
                requestKey.body.xpath = xpathNodes;
            }

        }


        if (typeof requestKeyParam.body !== 'undefined' &&
            typeof requestKeyParam.body.json !== 'undefined') {

            // json querying!
            var jsonValues = extractJson(req, requestKeyParam.body.json);
            if (typeof jsonValues !== 'undefined') {
                requestKey.body = requestKey.body || {};
                requestKey.body.json = jsonValues;
            }

        }

        return JSON.stringify(requestKey);

    }

    function extractProperties (req, properties) {

        var keyPart = undefined;

        properties.forEach(function (property) {
            if (typeof req[property] !== 'undefined') {

                keyPart = addKeyPart(keyPart, property, req[property]);

            }
        });

        return keyPart;

    }

    function extractUrlParts (req, urlParts) {

        var keyPart = undefined;

        var url = $url.parse(req.path, true);

        urlParts.forEach(function (urlPart) {

            if (typeof url[urlPart] !== 'undefined') {

                keyPart = addKeyPart(keyPart, urlPart, url[urlPart]);

            }

        });

        return keyPart;

    }

    function extractQuery (req, queryParams) {

        var keyPart = undefined;

        var url = $url.parse(req.path, true);

        queryParams.forEach(function (queryParam) {

            if (typeof url.query[queryParam] !== 'undefined') {

                keyPart = addKeyPart(keyPart, queryParam, url.query[queryParam]);

            }

        });

        return keyPart;

    }

    function extractHeaders (req, headers) {

        var keyPart = undefined;

        // copy request headers to a forced-lowercase format
        var lowerCasedHeaders = {};
        Object.keys(req.headers).forEach(function (header) {
            lowerCasedHeaders[header.toLowerCase()] = req.headers[header];
        });

        headers.forEach(function (headerKey) {
            headerKey = headerKey.toLowerCase();
            if (typeof lowerCasedHeaders[headerKey] !== 'undefined') {

                keyPart = addKeyPart(keyPart, headerKey, lowerCasedHeaders[headerKey]);

            }
        });

        return keyPart;

    }

    function extractXpath (req, xpathQueries) {

        var keyPart = undefined;

        try {

            var body;
            body = new $xmldom.DOMParser().parseFromString(req.body);

            if (typeof body !== 'undefined') {

                xpathQueries.forEach(function (xpathQuery) {

                    var value = $xpath(body, xpathQuery);
                    if (typeof value !== 'undefined') {

                        keyPart = addKeyPart(keyPart, xpathQuery, value.toString());

                    }

                });

            }

        } catch (e) {}

        return keyPart;

    }

    function extractJson (req, objectKeys) {

        var keyPart = undefined;

        try {

            // parse the body as JSON first
            var body;
            body = JSON.parse(req.body);

            if (typeof body !== 'undefined') {

                objectKeys.forEach(function (jsonKey) {

                    var value = $utils.extractConfig(jsonKey, body);

                    if (typeof value !== 'undefined') {
                        keyPart = addKeyPart(keyPart, jsonKey, value);
                    }

                });

            }


        } catch (e) {}

        return keyPart;

    }

    function addKeyPart (src, key, value) {

        // force object
        src = src || {};

        // add part
        src[key] = value;

        return src;

    }

}