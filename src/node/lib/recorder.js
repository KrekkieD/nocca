'use strict';

module.exports.clearMocks = clearMocks;
module.exports.loadMocksFromJson = loadMocksFromJson;
module.exports.loadMocksFromFile = loadMocksFromFile;
module.exports.recordRequest = recordRequest;
module.exports.saveMock = saveMock;
module.exports.isRecorded = isRecorded;
module.exports.respond = respond;
module.exports.respondWithMock = respondWithMock;
module.exports.defaultKeyGenerator = defaultKeyGenerator;
module.exports.exportState = exportState;

var $mock = require('./mock');

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
    importedMocks: [],
    // array of requestKeys used for responses
    hitMocks: []
    // TODO: do we register forwarded + unrecorded mocks too?
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

        _mockedRequests.mocks[requestKey] = $mock.fromJson(jsonObject[requestKey]);
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

function recordRequest (req) {

    // returns promise, will resolve with mock
    return $mock.recordRequest(req);

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

    // store mock in object
    _mockedRequests.mocks[requestKey] = mock;

    //$fs.writeFileSync('./stub/caches.json', JSON.stringify(_mockedRequests.mocks, null, 4));

}

function respondWithMock (mock, res) {

    $mock.respond(mock, res);

}

function respond (requestKey, res) {

    if (isRecorded(requestKey)) {
        _mockedRequests.hitMocks.push(requestKey);
        respondWithMock(_mockedRequests.mocks[requestKey], res);
    }
    else {
        console.log('Called respond with requestKey but no mock found');
        res.statusCode(500);
        res.body('Booboo!');
        res.end();
    }

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