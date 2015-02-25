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
module.exports.transformRequestIntoMock = transformRequestIntoMock;
module.exports.camelCaseAndDashHeaders = camelCaseAndDashHeaders;    // +1

// transforms request stream into request object after completion of request

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