'use strict';

var $changeCase = require('change-case');
var $q = require('q');

module.exports = {};
module.exports.camelCaseAndDashHeaders = camelCaseAndDashHeaders;
module.exports.readBody = readBody;
module.exports.extractConfig = extractConfig;

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

function readBody (readable) {
    var deferred = $q.defer();
    var bufferArray = [];

    readable.on('end', function () {

        var data = '';

        if (bufferArray.length) {
            data = Buffer.concat(bufferArray);
        }

        deferred.resolve(data);

    });
    readable.on('error', function (err) { deferred.reject(err); });
    readable.on('data', function (chunk) {

        bufferArray.push(chunk);

        // Too much POST data, kill the connection!
        if (readable.socket.bytesRead > MAX_INCOMING_BODY_LENGTH) {
            // TODO: needs Nocca for logging properly!
            console.log('Killed connection due to oversized incoming body length (' + readable.socket.bytesRead + '/' + MAX_INCOMING_BODY_LENGTH + ')');
            deferred.reject('Request body data size overflow. Not accepting request bodies larger than ' + (MAX_INCOMING_BODY_LENGTH) + ' bytes');
            readable.socket.destroy();
        }

    });

    return deferred.promise;
}

function extractConfig (key, obj, asPromise) {

    var workingObj = obj;

    var extractedConfig;

    var keys = key.split('.');

    while (keys.length) {
        key = keys.shift();
        workingObj = workingObj[key];
        extractedConfig = workingObj;

        if (typeof extractedConfig === 'undefined') {
            break;
        }
    }

    if (asPromise) {

        var deferred = $q.defer();

        if (typeof extractedConfig !== 'undefined') {
            deferred.resolve(extractedConfig);
        }
        else {
            deferred.reject();
        }

        return deferred.promise;
    }
    else {
        return extractedConfig;
    }

}
