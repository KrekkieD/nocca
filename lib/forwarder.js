'use strict';

var $utils = require('./utils');

var $q = require('q');
var $url = require('url');
var $extend = require('extend');
var $http = require('http');
var $https = require('https');
var $constants = require('constants');

module.exports = {};
module.exports.simpleForwarder = forwardRequest;

/* Default options for HTTPS requests */
// TODO: these should probably be configurable too..
var httpsRequestOptions = {
    secureOptions: $constants.SSL_OP_NO_TLSv1_2,
    ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
    honorCipherOrder: true
};

function forwardRequest(reqContext) {
    var deferred = $q.defer();

    // make copy to keep request object intact
    var fwdFlatReq = $extend({}, reqContext.request);

    var endpointDef = reqContext.endpoint.definition;
    if (!endpointDef) {
        console.log('|    Not forwarding, missing endpoint definition');
        
        reqContext.statusCode = 404;
        reqContext.errorCode = Nocca.constants.ERRORS.NO_ENDPOINT_FOUND;
        reqContext.errorMessage = 'Could not find endpoint for ' + reqContext.request.url;
        deferred.reject(reqContext);
    }
    // TODO: we might be replaying while forwarding is set to ALL
    else if (reqContext.playbackResponse) {
        // A pre-recorded mock response was found, we do not have to forward
        console.log('|    Not forwarding, recorded response was present');
        
        deferred.resolve(reqContext);
        
    }
    else {

        performRequestForward(reqContext, endpointDef, fwdFlatReq, deferred);

    }

    return deferred.promise;

    
}

function performRequestForward(reqContext, endpointDef, fwdFlatReq, deferred) {

    var resolvedUrl = $url.resolve(endpointDef.targetBaseUrl, reqContext.endpoint.remainingUrl);

    var targetUrl = $url.parse(resolvedUrl);
    console.log('|    Forwarding request to: ' + targetUrl.href);

    fwdFlatReq.protocol = targetUrl.protocol;
    fwdFlatReq.host = targetUrl.hostname;
    fwdFlatReq.path = targetUrl.path;

    // sync up host with new target
    fwdFlatReq.headers.host = fwdFlatReq.host;

    fwdFlatReq.headers = $extend({}, fwdFlatReq.headers);

    // format headers
    fwdFlatReq.headers = $utils.camelCaseAndDashHeaders(fwdFlatReq.headers, [], []);

    reqContext.proxiedFlatRequest = fwdFlatReq;
    reqContext.proxiedRequest = proxyRequest(fwdFlatReq);
    reqContext.proxiedResponse = {
        statusCode: 0,
        headers: {},
        body: ''
    };

    reqContext.proxiedRequest.on('response', function(response) {

        $utils.readBody(response)
            .then(function(body) {
                reqContext.proxiedResponse.statusCode = response.statusCode;
                reqContext.proxiedResponse.headers = response.headers;
                reqContext.proxiedResponse.body = body;

                deferred.resolve(reqContext);
            }).fail(function(err) {

                reqContext.statusCode = 500;
                reqContext.errorCode = Nocca.constants.ERRORS.NO_ENDPOINT_FOUND;
                reqContext.errorMessage = 'Could not forward request';
                reqContext.error = err;

                deferred.reject(reqContext);
            });

    });
    
    reqContext.proxiedRequest.on('error', function(err) {
        
        console.log('|      Error connecting to remote service: ' + err.message);
        reqContext.statusCode = 502;

        reqContext.errorCode = Nocca.constants.ERRORS.FORWARDER_REQUEST_ERROR;
        reqContext.errorMessage = 'Error when proxying request';
        reqContext.error = err;

        deferred.reject(reqContext);
    });


}

function proxyRequest(fwdFlatReq) {

    var isTargetHttps = fwdFlatReq.protocol === 'https:';

    var requestProvider = (isTargetHttps ? $https : $http);
    
    var requestOptions = $extend({}, httpsRequestOptions, fwdFlatReq);

    var proxiedRequest = requestProvider.request(requestOptions);

     if (typeof fwdFlatReq.body !== 'undefined' && fwdFlatReq.body.length > 0) {
        proxiedRequest.write(fwdFlatReq.body, function() {
            proxiedRequest.end();
        });
    }
    else {
        proxiedRequest.end();
    }

    return proxiedRequest;
}