'use strict';

var $q = require('q');
var $url = require('url');
var $extend = require('extend');
var $http = require('http');
var $https = require('https');
var $constants = require('constants');
var $changeCase = require('change-case');

var $recorder = require('./recorder');
var $caches = require('./caches');


module.exports = {};
module.exports.flattenIncomingRequest = flattenIncomingRequest;
module.exports.defaultKeyGenerator = defaultKeyGenerator;
module.exports.transformRequestIntoMock = transformRequestIntoMock;
module.exports.camelCaseAndDashHeaders = camelCaseAndDashHeaders;

// transforms request stream into request object after completion of request
function flattenIncomingRequest (req, options) {

    options = options || {};
    options.maxIncomingBodyLength = 1e6;

    var deferred = $q.defer();

    var flatReq = {
        url: req.url,
        method: req.method,
        path: req.path,
        headers: req.headers
    };

    req.on('data', function (data) {

        // add request body if not exists
        flatReq.body = flatReq.body || '';

        flatReq.body += data;

        // Too much POST data, kill the connection!
        if (flatReq.body.length > options.maxIncomingBodyLength) {

            req.connection.destroy();
            deferred.reject('Request body data size overflow. Not accepting request bodies larger than ' + (options.maxIncomingBodyLength) + ' bytes');

        }

    });

    req.on('end', function () {

        deferred.resolve(flatReq);

    });

    return deferred.promise;

}

function defaultKeyGenerator (req) {

    var headersArray = [];

    // stuff it in an array so that we can sort the order of the headers.
    // This will prevent any weird non-matching issues due to header order
    Object.keys(req.headers).forEach(function (headerKey) {
        headersArray.push(headerKey + ':' + req.headers[headerKey]);
    });

    // create unique key
    var reqKeyObj = {
        url: req.url,
        method: req.method,
        headers: headersArray.sort(),
        body: ''
    };

    return JSON.stringify(reqKeyObj);

}


function transformRequestIntoMock (flatReq) {

    // promise magic here. Give request, receive mock. Such wow.
    return getProxiedRequest(flatReq)
        .then(function (proxiedRequest) {

            // returns promise that resolves into mock
            return $recorder.recordRequest(proxiedRequest)
                .then(function (mock) {

                    // we need to stuff some data in the mock though, before returning
                    mock.mockData.rawRequest = flatReq;

                    return mock;

                });

        });

}

function getProxiedRequest (fwdFlatReq) {

    var deferred = $q.defer();

    var isTargetHttps = fwdFlatReq.protocol === 'https:';

    var requestProvider = (isTargetHttps ? $https : $http);

    var proxiedRequest = requestProvider.request(fwdFlatReq);

    deferred.resolve(proxiedRequest);

    if (typeof fwdFlatReq.body !== 'undefined') {
        proxiedRequest.write(fwdFlatReq.body, function() {
            proxiedRequest.end();
        });
    }
    else {
        proxiedRequest.end();
    }

    return deferred.promise;

}

function camelCaseAndDashHeadersOld (rawHeaders) {

    // The HTTP module transforms all header names to lower case during 'header normalization'.
    // This makes matching easier and less error prone.
    var skipHeaders = [
        'host'
    ];
    var dontFormatHeaders = [
        'soapaction'
    ];

    return formatHeaders(rawHeaders, skipHeaders, dontFormatHeaders);

}


function camelCaseAndDashHeaders (headers, skipHeaders, dontFormatHeaders) {

    var formattedHeaders = {};

    Object.keys(headers).forEach(function (headerKey) {

        if (skipHeaders.indexOf(headerKey.toLowerCase()) > -1) {
            return true;
        }

        var parsedHeaderKey = headerKey;

        if (dontFormatHeaders.indexOf(headerKey) === -1) {
            // parse headerKey to proper format
            parsedHeaderKey = headerKey.split('-').map(function (value) {
                return $changeCase.ucFirst(value);
            }).join('-');
        }

        formattedHeaders[parsedHeaderKey] = headers[headerKey];

    });

    return formattedHeaders;

}