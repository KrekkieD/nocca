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

    this.generateKey = generateKey;

    function generateKey (reqContext) {

        var deferred = $q.defer();

        var requestKeyParam = reqContext.config.requestKeyParams;

        var req = reqContext.getClientRequest();

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

        reqContext.requestKey = JSON.stringify(requestKey);

        deferred.resolve(reqContext);

        return deferred.promise;

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

        headers.forEach(function (headerKey) {
            if (typeof req.headers[headerKey] !== 'undefined') {

                keyPart = addKeyPart(keyPart, headerKey, req.headers[headerKey]);

            }
        });

        return keyPart;

    }

    function extractXpath (req, xpathQueries) {

        var keyPart = undefined;

        try {

            var body;
            body = $xmldom().DOMParser.parseFromString(req.body);

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