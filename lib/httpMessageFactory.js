'use strict';

var $zlib = require('zlib');
var $q = require('q');
var $http = require('http');
var $https = require('https');

var $utils = require('./utils');

module.exports = httpMessageFactory;

var constants = {
    IMPORT_AS_INCOMING_REQUEST: 'IMPORT_AS_INCOMING_REQUEST',
    IMPORT_AS_OUTGOING_REQUEST: 'IMPORT_AS_OUTGOING_REQUEST',
    IMPORT_AS_INCOMING_RESPONSE: 'IMPORT_AS_INCOMING_RESPONSE',
    IMPORT_AS_OUTGOING_RESPONSE: 'IMPORT_AS_OUTGOING_RESPONSE'
};

function httpMessageFactory (Nocca) {

    this.createInstance = createInstance;
    this.importAsIncomingRequest = importAsIncomingRequest;
    this.importAsOutgoingRequest = importAsOutgoingRequest;
    this.importAsIncomingResponse = importAsIncomingResponse;
    this.importAsOutgoingResponse = importAsOutgoingResponse;

    function createInstance () {
        return new HttpMessage();
    }


    function importAsIncomingRequest (req) {

        var instance = new HttpMessage(constants.IMPORT_AS_INCOMING_REQUEST);
        return instance;

    }

    function importAsOutgoingRequest (obj) {

        var instance = new HttpMessage(constants.IMPORT_AS_OUTGOING_REQUEST);
        return instance;

    }

    function importAsIncomingResponse (res) {

        var instance = new HttpMessage(constants.IMPORT_AS_INCOMING_RESPONSE);
        return instance;

    }

    function importAsOutgoingResponse (res) {

        var instance = new HttpMessage(constants.IMPORT_AS_OUTGOING_RESPONSE);
        return instance;

    }

}


HttpMessage.prototype.pack = pack;
HttpMessage.prototype.unpack = unpack;
HttpMessage.prototype.readIncomingMessage = readIncomingMessage;
HttpMessage.prototype.sendAsRequest = sendAsRequest;
HttpMessage.prototype.sendAsResponse = sendAsResponse;
HttpMessage.prototype._determineContentEncoding = _determineContentEncoding;

function HttpMessage () {

    // request or response
    this.type = undefined;

    // request params, used as request from Nocca to outside
    this.method = undefined;

    this.host = undefined;
    this.port = undefined;
    this.path = undefined;

    // response params, used as response from Nocca to client
    this.statusCode = undefined;
    this.statusMessage = undefined;

    // shared params
    this.headers = undefined;

    this.body = undefined;

    this.bodies = {
        incomingBuffer: undefined,
        incomingBody: undefined,
        outgoingBody: undefined,
        outgoingBuffer: undefined
    };

    // processing params
    this.rawBody = undefined;
    this._packedBody = undefined;
    this._unpackedBody = undefined;

    this._contentEncoding = undefined;
    this._packer = undefined;
    this._unpacker = undefined;

}


function _determineContentEncoding () {

    this._contentEncoding = this.headers['content-encoding'] ? this.headers['content-encoding'].toString() : false;

    switch (this._contentEncoding) {
        case 'gzip':
            this._packer = $zlib.gzip;
            this._unpacker = $zlib.gunzip;
            break;
        case 'deflate':
            this._packer = $zlib.deflate;
            this._unpacker = $zlib.inflate;
            break;
    }

    return this._contentEncoding;

}

function pack () {

    var self = this;

    var deferred = $q.defer();

    self._determineContentEncoding();

    if (self._packer) {
        self._packer(self.bodies.outgoingBody, function (err, resultBuffer) {
            if (err) {
                deferred.reject(err);
            }
            else {
                self.bodies.outgoingBuffer = resultBuffer;
                deferred.resolve(self.bodies.outgoingBuffer);
            }
        });
    }
    else {
        self.bodies.outgoingBuffer = new Buffer(self.bodies.outgoingBody);
        deferred.resolve(self.bodies.outgoingBuffer);
    }

    return deferred.promise;

}

function unpack () {

    var self = this;

    var deferred = $q.defer();

    self._determineContentEncoding();

    if (self._unpacker) {
        self._unpacker(self.bodies.incomingBuffer, function (err, resultBuffer) {
            if (err) {
                deferred.reject(err);
            }
            else {
                // TODO: do we want to overwrite this?
                self.bodies.incomingBuffer = resultBuffer;
                self.bodies.incomingBody = resultBuffer.toString();
                deferred.resolve(self.bodies.incomingBody);
            }
        });
    }
    else {
        self.bodies.incomingBody = self.bodies.incomingBuffer.toString();
        deferred.resolve(self.bodies.incomingBody);
    }

    return deferred.promise;

}

function readIncomingMessage (req) {

    var self = this;

    self.path = req.url;
    self.method = req.method;
    self.headers = req.headers;
    self.statusCode = req.statusCode;
    self.statusMessage = req.statusMessage;

    return $utils.readBody(req)
        .then(function (bodyBuffer) {
            self.bodies.incomingBuffer = bodyBuffer;
        });

}

function sendAsRequest () {

    var self = this;
    var fields = ['host', 'hostname', 'port', 'method', 'path', 'headers', 'auth'];

    var request = (self.protocol === 'https' ? $https : $http).request;

    var requestObj = {};

    fields.forEach(function (field) {
        if (typeof self[field] !== 'undefined') {
            requestObj[field] = self[field];
        }
    });

    request = request(requestObj);
    request.end(self.bodies.outgoingBody);

    return request;

}

function sendAsResponse (res) {

    var self = this;

    // perform encoding tricks if required
    return self.pack()
        .then(function () {

            // fix content-length
            // node always uses lowercase headers, so this lowercase check will suffice
            if (self.headers.hasOwnProperty('content-length')) {

                var bodyLength = self.bodies.outgoingBuffer.length;
                var contentLength = parseInt(self.headers['content-length']);

                if (bodyLength !== contentLength) {
                    //Nocca.logDebug('Content-Length header mismatches actual body size, adjusting header');
                    self.headers['content-length'] = bodyLength;
                }

            }

            // write the head
            res.writeHead(self.statusCode, self.headers || {});

            // and write the rest
            res.end(self.bodies.outgoingBuffer);

        });

}