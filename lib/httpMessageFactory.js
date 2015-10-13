'use strict';

var $zlib = require('zlib');
var $q = require('q');
var $http = require('http');
var $https = require('https');
var $constants = require('constants');
var $extend = require('extend');

var $utils = require('./utils');

module.exports = HttpMessageFactory;

function HttpMessageFactory (Nocca) {

    var self = this;

    var parentLogger = Nocca.logger.child({ module: 'HttpMessageFactory' });

    var constants = {
        REQUEST: 'REQUEST',
        RESPONSE: 'RESPONSE'
    };

    var exportProperties = {};
    exportProperties[constants.REQUEST] = {
        type: 'type',
        created: 'created',
        method: 'method',
        host: 'host',
        protocol: 'protocol',
        port: 'port',
        path: 'path',
        headers: 'headers',
        body: 'bodies.readable'
    };
    exportProperties[constants.RESPONSE] = {
        type: 'type',
        created: 'created',
        statusCode: 'statusCode',
        statusMessage: 'statusMessage',
        headers: 'headers',
        body: 'bodies.readable'
    };

    self.createRequest = createRequest;
    self.createResponse = createResponse;

    function createRequest (dumpObj) {
        var httpMessage = new HttpMessage(constants.REQUEST);

        if (typeof dumpObj !== 'undefined') {
            httpMessage.unDump(dumpObj);

        }

        return httpMessage;
    }
    function createResponse (dumpObj) {
        var httpMessage = new HttpMessage(constants.RESPONSE);

        if (typeof dumpObj !== 'undefined') {
            httpMessage.unDump(dumpObj);
        }

        return httpMessage;
    }

    function extractProperties (properties, subject, filterFn) {

        function extractNestedProperty (propertyString, subject) {

            var objValue = subject;
            var properties = propertyString.split('.');

            properties.forEach(function (property) {
                // cannot break a foreach, so if-statement
                if (typeof objValue !== 'undefined') {
                    objValue = objValue[property];
                }
            });

            return objValue;

        }


        var obj = {};

        Object.keys(properties).forEach(function (property) {

            var value = properties[property];

            // resolve objValue
            var objValue;

            if (value.indexOf('.') > -1) {

                objValue = extractNestedProperty(value, subject);

            }
            else {
                objValue = subject[value];
            }


            if (!filterFn || filterFn(objValue)) {
                obj[property] = objValue;
            }

        });

        return obj;

    }

    function HttpMessage (type) {

        var self = this;

        self.getBody = getBody;
        self.setBody = setBody;
        self.pack = pack;
        self.unpack = unpack;
        self.readIncomingMessage = readIncomingMessage;
        self.sendAsRequest = sendAsRequest;
        self.sendAsResponse = sendAsResponse;
        self._determineContentEncoding = _determineContentEncoding;
        self.dump = dump;
        self.unDump = unDump;

        // request or response
        self.type = type;

        // timestamp of message creation
        self.created = new Date().getTime();

        // request params, used as request from Nocca to outside
        self.method = undefined;
        self.host = undefined;
        self.port = undefined;
        self.path = undefined;
        self.protocol = undefined;

        // response params, used as response from Nocca to client
        self.statusCode = undefined;
        self.statusMessage = undefined;

        // shared params
        self.headers = undefined;

        self.body = undefined;

        self.bodies = {
            raw: undefined,
            buffer: undefined,
            readable: undefined
        };

        self._isBinary = undefined;
        self._contentEncoding = undefined;
        self._packer = undefined;
        self._unpacker = undefined;

        function _determineContentEncoding () {

            // TODO: may need more mime types here
            self._isBinary = self.headers['content-type'] && (
                self.headers['content-type'].indexOf('image/') > -1 ||
                self.headers['content-type'].indexOf('font') > -1);

            self._contentEncoding = self.headers['content-encoding'] ? self.headers['content-encoding'].toString() : false;

            switch (self._contentEncoding) {
                case 'gzip': {
                    self._packer = $zlib.gzip;
                    self._unpacker = $zlib.gunzip;
                    break;
                }
                case 'deflate': {
                    self._packer = $zlib.deflate;
                    self._unpacker = $zlib.inflate;
                    break;
                }
            }

            return self._contentEncoding;

        }

        function getBody (type) {

            type = type || 'readable';
            return self.bodies[type];

        }

        function setBody (body, type) {

            type = type || 'readable';
            self.bodies[type] = body;

            return self.bodies[type];

        }

        function pack () {

            var deferred = $q.defer();

            self._determineContentEncoding();

            if (self._packer) {

                // make sure there's a buffer body waiting for us
                if (self.getBody() && !self.getBody('buffer')) {
                    self.setBody(new Buffer(self.getBody()), 'buffer');
                }

                self._packer(self.getBody('buffer'), function (err, resultBuffer) {
                    if (err) {
                        deferred.reject(err);
                    }
                    else {
                        deferred.resolve(self.setBody(resultBuffer, 'raw'));
                    }
                });
            }
            else {
                deferred.resolve(self.setBody(new Buffer(self.getBody()), 'raw'));
            }

            return deferred.promise;

        }

        function unpack () {

            var deferred = $q.defer();

            self._determineContentEncoding();

            if (self._unpacker) {
                self._unpacker(self.getBody('raw'), function (err, resultBuffer) {
                    if (err) {
                        deferred.reject(err);
                    }
                    else {
                        self.setBody(resultBuffer, 'buffer');
                        self.setBody(self._isBinary ? resultBuffer : resultBuffer.toString());
                        deferred.resolve(self.getBody());
                    }
                });
            }
            else {
                self.setBody(self.getBody('raw'), 'buffer');
                self.setBody(self._isBinary ? self.getBody('buffer') : self.getBody('buffer').toString());
                deferred.resolve(self.getBody());
            }

            return deferred.promise;

        }

        function readIncomingMessage (req) {

            self.path = req.url;
            self.method = req.method;
            self.headers = req.headers;
            self.statusCode = req.statusCode;
            self.statusMessage = req.statusMessage;

            parentLogger.debug('reading incoming body');
            return $utils.readBody(req)
                .then(function (bodyBuffer) {
                    self.setBody(bodyBuffer, 'raw');
                    parentLogger.debug('incoming body read');

                });

        }

        function sendAsRequest () {

            var fields = {
                host: 'host',
                hostname: 'hostname',
                port: 'port',
                method: 'method',
                path: 'path',
                headers: 'headers',
                auth: 'auth'
            };

            var requestObj = extractProperties(fields, self, function (value) {
                return typeof value !== 'undefined';
            });

            var isHttps = self.protocol === 'https:';

            var request = (isHttps ? $https : $http).request;

            if (isHttps) {
                // Default options for HTTPS requests
                // TODO: this should probably be configurable too..
                requestObj.secureOptions = $constants.SSL_OP_NO_TLSv1_2;
                requestObj.ciphers = 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM';
                requestObj.honorCipherOrder = true;
            }


            request = request(requestObj);
            request.end(self.getBody());

            return request;

        }

        function sendAsResponse (res) {

            // perform encoding tricks if required
            return self.pack()
                .then(function () {

                    // fix content-length
                    // node always uses lowercase headers, so this lowercase check will suffice
                    if (self.headers.hasOwnProperty('content-length')) {

                        var bodyLength = self.getBody('raw').length;
                        var contentLength = parseInt(self.headers['content-length']);

                        if (bodyLength !== contentLength) {
                            parentLogger.warn('Content-Length header mismatches actual body size, adjusting header');
                            self.headers['content-length'] = bodyLength;
                        }

                    }

                    // write the head
                    res.writeHead(self.statusCode, self.headers || {});

                    // and write the rest
                    res.end(
                        self.getBody('raw'),
                        self._isBinary ? 'binary' : 'utf8'
                    );

                });

        }

        function dump () {

            var dumpedObj = extractProperties(exportProperties[self.type], self);
            if (self._isBinary) {
                dumpedObj.body = '-- binary data --';
            }

            return dumpedObj;

        }

        // fancy name for import
        function unDump (dumpObj) {

            Object.keys(dumpObj).forEach(function (key) {
                if (key === 'body') {
                    self.setBody(dumpObj[key]);
                }
                else if (self.hasOwnProperty(key)) {

                    if (dumpObj[key] instanceof Object) {
                        self[key] = $extend({}, dumpObj[key]);
                    }
                    else {
                        self[key] = dumpObj[key];
                    }

                }
            });

        }

    }

}


