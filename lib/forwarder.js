'use strict';
// TODO: this file should also be instance based
var $utils = require('./utils');

var $q = require('q');
var $url = require('url');
var $extend = require('extend');

module.exports = Forwarder;

function Forwarder (Nocca) {

    var self = this;

    self.logger = Nocca.logger.child({ module: 'Forwarder' });

	forwardRequest.prepareProxyRequest = prepareProxyRequest;
    return forwardRequest;

    function forwardRequest (reqContext) {

        var deferred = $q.defer();

        var req = reqContext.getClientRequest();

        var endpointDef = reqContext.endpoint.definition;

        // generally this should be caught by the endpoint selector..
        // but since everything is configurable, swapping that with a lesser alternative might bring us here
        if (!endpointDef) {
            self.logger.warn('Not forwarding, missing endpoint definition');

            reqContext.statusCode = 404;
            reqContext.errorCode = Nocca.constants.ERRORS.NO_ENDPOINT_FOUND;
            reqContext.errorMessage = 'Could not find endpoint for ' + req.path;
            deferred.reject(reqContext);
        }
        else if (reqContext.getPlaybackResponse() &&
            reqContext.config.forward !== Nocca.constants.FORWARDING_FORWARD_ALL) {

            // A pre-recorded mock response was found, we do not have to forward, and config indicates we don't forward ALL
            self.logger.info('Not forwarding, recorded response was present or forwarding is not set to ALL');

            deferred.resolve(reqContext);

        }
        else {

            _performRequestForward(reqContext, deferred);

        }

        return deferred.promise;


    }

	function prepareProxyRequest (reqContext) {

		var deferred = $q.defer();

		var endpointDef = reqContext.endpoint.definition;
		if (endpointDef) {

			var req = reqContext.getClientRequest();

			// extract details from the original request
			var proxyReq = Nocca.httpMessageFactory.createRequest();
			proxyReq.method = req.method;
			proxyReq.headers = $extend({}, req.headers);
			proxyReq.setBody(req.getBody());

            var resolvedUrl = endpointDef.targetBaseUrl;

            // create a target URL based on remainingUrl content
            var parsedRemainingUrl = $url.parse(reqContext.endpoint.remainingUrl);

            if (parsedRemainingUrl.pathname !== null) {
                // some path remained, glue with '/' if required
                resolvedUrl += '/' + reqContext.endpoint.remainingUrl.replace(/^\//, '');
            }
            else if (parsedRemainingUrl.search !== null) {
                // join without glue
                resolvedUrl += reqContext.endpoint.remainingUrl;
            }

			var targetUrl = $url.parse(resolvedUrl);

			proxyReq.protocol = targetUrl.protocol;
			proxyReq.host = targetUrl.hostname;
			proxyReq.port = targetUrl.port;
			proxyReq.path = targetUrl.path;

			// sync up host header with new target
			proxyReq.headers.host = proxyReq.host;


			// format headers
			proxyReq.headers = $utils.camelCaseAndDashHeaders(proxyReq.headers, [
				/* remove these headers */

			], [
				/* dont parse these headers */

			]);


			// save in reqContext
			reqContext.setProxyRequest(proxyReq);

		}

		deferred.resolve(reqContext);

		return deferred.promise;

	}

    function _performRequestForward (reqContext, deferred) {

		var proxyReq = reqContext.getProxyRequest();

        self.logger.info('Forwarding request to: ' + proxyReq.host);

        var request = proxyReq.sendAsRequest();

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

                    self.logger.warn('Forwarding failed');
                    self.logger.error(err);

                    reqContext.statusCode = 500;
                    reqContext.errorCode = Nocca.constants.ERRORS.NO_ENDPOINT_FOUND;
                    reqContext.errorMessage = 'Could not forward request';
                    reqContext.error = err;

                    deferred.reject(reqContext);

                });

        });

        request.on('error', function (err) {

            self.logger.error('Error connecting to remote service: ' + err.message);
            reqContext.statusCode = 502;

            reqContext.errorCode = Nocca.constants.ERRORS.FORWARDER_REQUEST_ERROR;
            reqContext.errorMessage = 'Error when proxying request';
            reqContext.error = err;

            deferred.reject(reqContext);

        });


    }
}
