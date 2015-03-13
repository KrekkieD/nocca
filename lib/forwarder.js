'use strict';
// TODO: this file should also be instance based
var $utils = require('./utils');

var $q = require('q');
var $url = require('url');
var $extend = require('extend');

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
            Nocca.logWarning('Not forwarding, missing endpoint definition');

            reqContext.statusCode = 404;
            reqContext.errorCode = Nocca.constants.ERRORS.NO_ENDPOINT_FOUND;
            reqContext.errorMessage = 'Could not find endpoint for ' + req.path;
            deferred.reject(reqContext);
        }
        else if (reqContext.getPlaybackResponse() &&
            reqContext.config.forward !== Nocca.constants.FORWARDING_FORWARD_ALL) {

            // A pre-recorded mock response was found, we do not have to forward, and config indicates we don't forward ALL
            Nocca.logInfo('Not forwarding, recorded response was present or forwarding is set to ALL');

            deferred.resolve(reqContext);

        }
        else {

            _performRequestForward(reqContext, endpointDef, req, deferred);

        }

        return deferred.promise;


    }

    function _performRequestForward (reqContext, endpointDef, req, deferred) {

        // extract details from the original request
        var proxyReq = Nocca.httpMessageFactory.createRequest();
        proxyReq.method = req.method;
        proxyReq.headers = $extend({}, req.headers);
        proxyReq.setBody(req.getBody());

        var resolvedUrl = $url.resolve(endpointDef.targetBaseUrl, reqContext.endpoint.remainingUrl);

        var targetUrl = $url.parse(resolvedUrl);
        Nocca.logInfo('Forwarding request to: ' + targetUrl.href);

        proxyReq.protocol = targetUrl.protocol;
        proxyReq.host = targetUrl.hostname;
        proxyReq.path = targetUrl.path;
        // sync up host header with new target
        proxyReq.headers.host = proxyReq.host;


        // format headers
        proxyReq.headers = $utils.camelCaseAndDashHeaders(proxyReq.headers, [
            /* removeHeaders */
        ], [
            /* dont parse headers */
        ]);


        // save in reqContext
        reqContext.setProxyRequest(proxyReq);

        var request = proxyReq.sendAsRequest();

        // TODO: make configurable
        //request.setTimeout(5000, function () {
        //    Nocca.logWarning('Aborted request due to 2s timeout');
        //    request.abort();
        //});

        request.on('response', function (response) {

            var proxyRes = Nocca.httpMessageFactory.createResponse();

            proxyRes.readIncomingMessage(response)
                .then(function () {
                    return proxyRes.unpack();
                })
                .then(function () {

                    reqContext.setProxyResponse(proxyRes);

                    deferred.resolve(reqContext);

                }).fail(function(err) {

                    Nocca.logWarning('Forwarding failed');
                    Nocca.logError(err);

                    reqContext.statusCode = 500;
                    reqContext.errorCode = Nocca.constants.ERRORS.NO_ENDPOINT_FOUND;
                    reqContext.errorMessage = 'Could not forward request';
                    reqContext.error = err;

                    deferred.reject(reqContext);

                });

        });

        request.on('error', function (err) {

            Nocca.logWarning('Error connecting to remote service: ' + err.message);
            reqContext.statusCode = 502;

            reqContext.errorCode = Nocca.constants.ERRORS.FORWARDER_REQUEST_ERROR;
            reqContext.errorMessage = 'Error when proxying request';
            reqContext.error = err;

            deferred.reject(reqContext);

        });


    }
}
