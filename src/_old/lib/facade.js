'use strict';

var $recorder = require('./recorder');
var $mock = require('./mock');


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