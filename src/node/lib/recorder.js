'use strict';

module.exports.clearMocks = clearMocks;
module.exports.loadMocksFromJson = loadMocksFromJson;
module.exports.loadMocksFromFile = loadMocksFromFile;
module.exports.createMockFromRequest = createMockFromRequest;
module.exports.saveMock = saveMock;
module.exports.isRecorded = isRecorded;
module.exports.respond = respond;
module.exports.defaultKeyGenerator = defaultKeyGenerator;

var $q = require('q');
var $fs = require('fs');

var _recordedRequests = {};

function clearMocks () {

    Object.keys(_recordedRequests).forEach(function (requestKey) {

        delete _recordedRequests[requestKey];

    });

}

function loadMocksFromJson (jsonObject) {

    if (typeof jsonObject === 'string') {
        jsonObject = JSON.parse(jsonObject);
    }

    Object.keys(jsonObject).forEach(function (requestKey) {

        _recordedRequests[requestKey] = jsonObject[requestKey];

    });

}

function loadMocksFromFile (filePath) {

    var mocks = $fs.readFileSync(filePath);

    // assume JSON?
    // TODO: to assume is making an ass of u and me
    loadMocksFromJson(mocks);

}

function isRecorded (requestKey) {

    return typeof _recordedRequests[requestKey] !== 'undefined';

}

function createMockFromRequest (req) {

    var deferred = $q.defer();

    // record the request response into the _recordedRequests obj

    var mock = {
        url: req.url,
        headers: {},
        data: ''
    };

    req.on('response', function (response) {

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {

            mock.data += chunk;

        });

        //the whole response has been recieved, so we just print it out here
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

function saveMock (requestKey, mock) {

    // done! process recorded object
    _recordedRequests[requestKey] = mock;

    //$fs.writeFileSync('./stub/caches.json', JSON.stringify(_recordedRequests, null, 4));

}

function respond (requestKey, res) {

    var recordedResponse = _recordedRequests[requestKey];

    res.writeHead(200, recordedResponse.headers);

    res.write(recordedResponse.data, function () {

        res.end();

    });

}

function defaultKeyGenerator (req) {

    var headersArray = [];

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