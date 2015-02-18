'use strict';

module.exports.fromJson = readMockFromJson;
module.exports.recordRequest = recordRequest;
module.exports.respond = respond;

var $q = require('q');

function recordRequest (req) {

    var deferred = $q.defer();

    // record the request response into the _mockedRequests.mocks obj

    var mock = {
        requestKey: '',
        url: req.url,
        headers: {},
        data: ''
    };

    req.on('response', function (response) {

        // another chunk of data has been received, so append it to `str`
        response.on('data', function (chunk) {

            mock.data += chunk;

        });

        // the whole response has been received, so we just print it out here
        response.on('end', function () {

            mock.headers = response.headers;

            deferred.resolve(mock);

        });

        response.on('error', function (err) {

            deferred.reject(err);

        });

    });

    return deferred.promise;

}

function readMockFromJson (mock) {

    // no weird format yet
    return JSON.parse(mock);

}

function respond (mock, res) {

    res.writeHead(200, mock.headers);

    res.write(mock.data, function () {

        res.end();

    });

}