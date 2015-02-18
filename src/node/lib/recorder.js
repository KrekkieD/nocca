'use strict';

module.exports.clearMocks = clearMocks;
module.exports.loadMocksFromJson = loadMocksFromJson;
module.exports.loadMocksFromFile = loadMocksFromFile;
module.exports.createMockFromRequest = createMockFromRequest;
module.exports.saveMock = saveMock;
module.exports.isRecorded = isRecorded;
module.exports.respond = respond;
module.exports.defaultKeyGenerator = defaultKeyGenerator;
module.exports.exportState = exportState;

var $q = require('q');
var $fs = require('fs');
var $extend = require('extend');

var _mockedRequests = {
    // requestKey: mock
    mocks: {},
    // array of requestKeys of mocks saved this session
    newMocks: [],
    // array of requestKeys of mocks that are overwritten this session
    modifiedMocks: [],
    // array of requestKeys of mocks imported this session
    importedMocks: []
};

function exportState () {

    // return a copy of _mockedRequests (to prevent unwanted manipulation)
    return $extend({}, _mockedRequests);

}

function clearMocks () {

    Object.keys(_mockedRequests.mocks).forEach(function (requestKey) {

        delete _mockedRequests.mocks[requestKey];

    });

}

function loadMocksFromJson (jsonObject) {

    if (typeof jsonObject === 'string') {
        jsonObject = JSON.parse(jsonObject);
    }

    Object.keys(jsonObject).forEach(function (requestKey) {

        _mockedRequests.mocks[requestKey] = jsonObject[requestKey];
        _mockedRequests.importedMocks.push(requestKey);

    });

}

function loadMocksFromFile (filePath) {

    var mocks = $fs.readFileSync(filePath);

    // assume JSON?
    // TODO: to assume is making an ass of u and me
    loadMocksFromJson(mocks);

}

function isRecorded (requestKey) {

    return typeof _mockedRequests.mocks[requestKey] !== 'undefined';

}

function createMockFromRequest (req) {

    var deferred = $q.defer();

    // record the request response into the _mockedRequests.mocks obj

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

    if (isRecorded(requestKey)) {
        // change on existing mock
        _mockedRequests.modifiedMocks.push(requestKey);
    }
    else {
        // new mock, keep track
        _mockedRequests.newMocks.push(requestKey);
    }

    // done! process recorded object
    _mockedRequests.mocks[requestKey] = mock;

    //$fs.writeFileSync('./stub/caches.json', JSON.stringify(_mockedRequests.mocks, null, 4));

}

function respond (requestKey, res) {

    var recordedResponse = _mockedRequests.mocks[requestKey];

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