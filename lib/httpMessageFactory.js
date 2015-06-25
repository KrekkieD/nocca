'use strict';

var $zlib = require('zlib');
var $q = require('q');
var $http = require('http');
var $https = require('https');
var $constants = require('constants');
var $extend = require('extend');
var $crypto = require('crypto');

var $utils = require('./utils');

module.exports = HttpMessageFactory;

function HttpMessageFactory (Nocca) {

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

    this.createRequest = createRequest;
    this.createResponse = createResponse;

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
            var objValue = undefined;

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

    HttpMessage.prototype.getBody = getBody;
    HttpMessage.prototype.setBody = setBody;
    HttpMessage.prototype.pack = pack;
    HttpMessage.prototype.unpack = unpack;
    HttpMessage.prototype.readIncomingMessage = readIncomingMessage;
    HttpMessage.prototype.sendAsRequest = sendAsRequest;
    HttpMessage.prototype.sendAsResponse = sendAsResponse;
    HttpMessage.prototype._determineContentEncoding = _determineContentEncoding;
    HttpMessage.prototype.messageKey = messageKey;
    HttpMessage.prototype.dump = dump;
    HttpMessage.prototype.unDump = unDump;

    function HttpMessage (type) {

        // request or response
        this.type = type;

        // timestamp of message creation
        this.created = new Date().getTime();

        // request params, used as request from Nocca to outside
        this.method = undefined;
        this.host = undefined;
        this.port = undefined;
        this.path = undefined;
        this.protocol = undefined;

        // response params, used as response from Nocca to client
        this.statusCode = undefined;
        this.statusMessage = undefined;

        // shared params
        this.headers = undefined;

        this.body = undefined;

        this.bodies = {
            raw: undefined,
            buffer: undefined,
            readable: undefined
        };

        this._isBinary = undefined;
        this._contentEncoding = undefined;
        this._packer = undefined;
        this._unpacker = undefined;

    }


    function _determineContentEncoding () {

        // TODO: may need more here
        this._isBinary = this.headers['content-type'] && (
            this.headers['content-type'].indexOf('image/') > -1 ||
            this.headers['content-type'].indexOf('font') > -1);

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

    function getBody (type) {

        type = type || 'readable';
        return this.bodies[type];

    }

    function setBody (body, type) {

        type = type || 'readable';
        this.bodies[type] = body;

        return this.bodies[type];

    }

    function pack () {

        var self = this;

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

        var self = this;

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

        var self = this;

        self.path = req.url;
        self.method = req.method;
        self.headers = req.headers;
        self.statusCode = req.statusCode;
        self.statusMessage = req.statusMessage;

        Nocca.logDebug('reading incoming body');
        return $utils.readBody(req)
            .then(function (bodyBuffer) {
                self.setBody(bodyBuffer, 'raw');
                Nocca.logDebug('incoming body read');

            });

    }

    function sendAsRequest () {

        var self = this;
        var fields = {
            host: 'host',
            hostname: 'hostname',
            port: 'port',
            method: 'method',
            path: 'path',
            headers: 'headers',
            auth:'auth'
        };

        var requestObj = extractProperties(fields, this, function (value) {
            return typeof value !== 'undefined';
        });

        var isHttps = self.protocol === 'https:';

        var request = (isHttps ? $https : $http).request;

        if (isHttps) {
            /* Default options for HTTPS requests */
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

        var self = this;

        // perform encoding tricks if required
        return self.pack()
            .then(function () {

                // fix content-length
                // node always uses lowercase headers, so this lowercase check will suffice
                if (self.headers.hasOwnProperty('content-length')) {

                    var bodyLength = self.getBody('raw').length;
                    var contentLength = parseInt(self.headers['content-length']);

                    if (bodyLength !== contentLength) {
                        Nocca.logDebug('Content-Length header mismatches actual body size, adjusting header');
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


    function messageKey () {

        var keyObj = $extend(true, {}, this.dump());

        // remove timestamp to prevent getting unique keys for identical requests
        delete keyObj.created;

        return _hashCode(JSON.stringify(keyObj));

    }

    function dump () {

        var dumpedObj = extractProperties(exportProperties[this.type], this);
        if (this._isBinary) {
            dumpedObj.body = '-- binary data --';
        }

        return dumpedObj;

    }

    // fancy name for import
    function unDump (dumpObj) {

        var self = this;
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

    function _hashCode (str) {

        var sha1 = $crypto.createHash('sha1');
        return sha1.update(str).digest('base64');

    }


}


