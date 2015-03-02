'use strict';

var $changeCase = require('change-case');
var $q = require('q');

module.exports = {};
module.exports.camelCaseAndDashHeaders = camelCaseAndDashHeaders;    // +1
module.exports.readBody = readBody;

var MAX_INCOMING_BODY_LENGTH = 1e6;

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

function readBody(readable, parse) {
    var d = $q.defer();
    var data = '';

    readable.on('end', function() {
        if (parse) {
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                data = null;
            }
        }

        d.resolve( data );
    });
    readable.on('close', function() { d.resolve('data'); });
    readable.on('error', function(err) { d.reject(err); });
    readable.on('data', function(chunk) {
        data += chunk;

        // Too much POST data, kill the connection!
        if (data.length > MAX_INCOMING_BODY_LENGTH) {
            d.reject('Request body data size overflow. Not accepting request bodies larger than ' + (MAX_INCOMING_BODY_LENGTH) + ' bytes');
        }
    });

    return d.promise;
}

