'use strict';
// TODO: this file should also be instance based
var $utils = require('./utils');

var $q = require('q');
var $url = require('url');
var $extend = require('extend');
var $http = require('http');
var $https = require('https');
var $constants = require('constants');


module.exports = Forwarder;

function Forwarder (Nocca) {

    return forwardRequest;

    function forwardRequest (reqContext) {

        var deferred = $q.defer();

        var req = reqContext.getClientRequest();

        var endpointDef = reqContext.endpoint.definition;

        // generally this should be caught by the endpoint selector..
        // but since everything is configurable, swapping that with a lesser alternative might bring us here
        if (!endpointDef) {
            console.log('|    Not forwarding, missing endpoint definition');

            reqContext.statusCode = 404;
            reqContext.errorCode = Nocca.constants.ERRORS.NO_ENDPOINT_FOUND;
            reqContext.errorMessage = 'Could not find endpoint for ' + req.path;
            deferred.reject(reqContext);
        }
        else if (reqContext.getPlaybackResponse() &&
            reqContext.config.forward !== Nocca.constants.FORWARDING_FORWARD_ALL) {

            // A pre-recorded mock response was found, we do not have to forward, and config indicates we don't forward ALL
            console.log('|    Not forwarding, recorded response was present');

            deferred.resolve(reqContext);

        }
        else {



            _performRequestForward(reqContext, endpointDef, req, deferred);

        }

        return deferred.promise;


    }

    function _performRequestForward (reqContext, endpointDef, req, deferred) {

        // extract details from the original request
        var proxyReq = Nocca.httpMessageFactory.createInstance();
        proxyReq.method = req.method;
        proxyReq.headers = req.headers;
        proxyReq.bodies.outgoingBodybody = req.bodies.incomingBody;

        var resolvedUrl = $url.resolve(endpointDef.targetBaseUrl, reqContext.endpoint.remainingUrl);

        var targetUrl = $url.parse(resolvedUrl);
        console.log('|    Forwarding request to: ' + targetUrl.href);

        proxyReq.protocol = targetUrl.protocol;
        proxyReq.host = targetUrl.hostname;
        proxyReq.path = targetUrl.path;
        // sync up host header with new target
        proxyReq.headers.host = proxyReq.host;

        if (proxyReq.protocol === 'https') {
            /* Default options for HTTPS requests */
            // TODO: these should probably be configurable too..
            proxyReq.headers.secureOptions = $constants.SSL_OP_NO_TLSv1_2;
            proxyReq.headers.ciphers = 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM';
            proxyReq.headers.honorCipherOrder = true;
        }

        // format headers
        proxyReq.headers = $utils.camelCaseAndDashHeaders(proxyReq.headers, [], []);

        // save in reqContext
        reqContext.setProxyRequest(proxyReq);

        var request = proxyReq.sendAsRequest();

        request.on('response', function (response) {

            var proxyRes = Nocca.httpMessageFactory.createInstance();

            proxyRes.readIncomingMessage(response)
                .then(function () {
                    return proxyRes.unpack();
                })
                .then(function () {

                    //proxyRes.statusCode = response.statusCode;
                    //proxyRes.statusMessage = response.statusMessage;
                    //proxyRes.headers = response.headers;
                    proxyRes.bodies.outgoingBody = proxyRes.bodies.incomingBody;
                    proxyRes.bodies.outgoingBuffer = proxyRes.bodies.incomingBuffer;

                    reqContext.setProxyResponse(proxyRes);

                    deferred.resolve(reqContext);

                }).fail(function(err) {

                    reqContext.statusCode = 500;
                    reqContext.errorCode = Nocca.constants.ERRORS.NO_ENDPOINT_FOUND;
                    reqContext.errorMessage = 'Could not forward request';
                    reqContext.error = err;

                    deferred.reject(reqContext);

                });

        });

        request.on('error', function (err) {

            console.log('|      Error connecting to remote service: ' + err.message);
            reqContext.statusCode = 502;

            reqContext.errorCode = Nocca.constants.ERRORS.FORWARDER_REQUEST_ERROR;
            reqContext.errorMessage = 'Error when proxying request';
            reqContext.error = err;

            deferred.reject(reqContext);

        });


    }
}
