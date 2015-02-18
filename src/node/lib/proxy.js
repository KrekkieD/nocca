'use strict';

module.exports = {};
module.exports.proxy = createNewProxy;

var $q = require('q');
var $constants = require('constants');
var $changeCase = require('change-case');

var $url  = require('url');
var http = require('http');
var https = require('https');
var $extend = require('extend');


var $caches = require('./caches');
var $recorder = require('./recorder');
var $utils = require('./utils');

// set to false to disable logging in console
var verbose = true;

var logUtility = verbose ? console.log : function () {};

var defaultOptions = {
    port: 3003,
    record: true,
    // false, true, 'MISSING'
    forward: 'MISSING',
    logging: true,
    keyGenerator: $utils.defaultKeyGenerator,
    // TODO: hardcoded here as this is implementation specific and should not be here
    mockFormatter: function (mock) {

        function formatHeaders (headers, skipHeaders, dontFormatHeaders) {

            var formattedHeaders = {};

            Object.keys(headers).forEach(function (headerKey) {

                if (skipHeaders.indexOf(headerKey.toLowerCase()) > -1) {
                    return true;
                }

                var parsedHeaderKey = headerKey;

                if (dontFormatHeaders.indexOf(headerKey) === -1) {
                    // parse headerKey to proper format
                    parsedHeaderKey = headerKey.split('-').map(function (value) {
                        return $changeCase.ucFirst(value);
                    }).join('-');
                }

                formattedHeaders[parsedHeaderKey] = headers[headerKey];

            });

            return formattedHeaders;

        }

        // manipulate the mock headers
        mock.headers = formatHeaders(mock.headers, [], ['soapaction']);

        return mock;
    }
};

function createNewProxy (requestedOptions) {

    if (typeof requestedOptions === 'number') {
        requestedOptions = {port: requestedOptions};
    }

    // TODO: would be nice to mix in endpoint specific config, i.e. record the google.com endpoint, but not bing.com
    // TODO: key gen should be specified in config (either as default or overridden per endpoint)
    var opts = $extend({}, defaultOptions, requestedOptions);

    var logger = opts.logging ? logUtility : function () {};

    logger('|  Creating new Proxy with options:', opts);

    // TODO: indention is getting a bit deep, should probably use some named functions but at the same time still be able to access the opts
    http.createServer(function(req, res) {

        logger('|  Request: ' + req.url);

        $utils.flattenIncomingRequest(req)
            .then(function (flatReq) {

                var requestKey = opts.keyGenerator(flatReq);

                // either always forward, or only forward for unknown requestKeys if opts.forward === 'missing'
                if (opts.forward === true ||
                    (opts.forward.toUpperCase() === 'MISSING' && !$recorder.isRecorded(requestKey))) {


                    // call proxy logic (endpoints et al) here to manipulate flatReq into
                    // pointing the right way with proper values
                    forwardizeFlatRequest(flatReq)
                        .then(function (fwdFlatRequest) {
                            return $utils.transformRequestIntoMock(fwdFlatRequest);
                        })
                        .then(function (mock) {

                            logger('|    Target response captured');

                            // manipulate if requested in opts
                            if (typeof opts.mockFormatter !== 'undefined') {
                                mock = opts.mockFormatter(mock);
                            }

                            if (opts.record) {
                                // should record that stuff, then respond

                                // save mock!
                                logger('|    Saving response as mock');
                                $recorder.saveMock(requestKey, mock);

                                // respond from requestKey
                                $recorder.respond(requestKey, res);

                            }
                            else {

                                // respond to original request
                                logger('|    Responding with forwarded mock');
                                $recorder.respondWithMock(mock, res);

                            }

                        });



                }
                // not forwarding -- or mock exists. that means we serve from CACHE or DIE
                else {

                    if ($recorder.isRecorded(requestKey)) {

                        logger('|    Responding with known mock');

                        // phew! mock is present, we live to die another day
                        $recorder.respond(requestKey, res);

                    }
                    else {

                        // aaarrrggghh
                        blockRequest(res);

                    }

                }


            });


    }).listen(opts.port);

    logger('Proxy listening on port ' + opts.port);

}


function blockRequest (res) {
    res.writeHead(501, {'Nocca-Error': '"Unable to either forward the request or replay a response"'});
    res.end();
}


function forwardizeFlatRequest (flatReq) {

    /* Default options for HTTPS requests */
    // TODO: these should probably be configurable too..
    var httpsRequestOptions = {
        secureOptions: $constants.SSL_OP_NO_TLSv1_2,
        ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
        honorCipherOrder: true
    };


    // deferring mainly for consistency in success/fail handling
    var deferred = $q.defer();

    // make copy to keep flatReq intact
    var fwdFlatReq = $extend({}, flatReq);

    var cache = selectCacheForUrl(fwdFlatReq.url);

    if (!cache.def) {
        deferred.reject({
            statusCode: '404',
            body: 'No cache URL found for ' + flatReq.url
        });
    }
    else {

        var resolvedUrl = $url.resolve(cache.def.targetBaseUrl, remainingUrlAfterCacheKey(fwdFlatReq.url, cache.key));

        var targetUrl = $url.parse(resolvedUrl);

        fwdFlatReq.protocol = targetUrl.protocol;
        fwdFlatReq.host = targetUrl.hostname;
        fwdFlatReq.path = targetUrl.path;

        // sync up host with new target
        fwdFlatReq.headers.host = fwdFlatReq.host;

        fwdFlatReq.headers = $extend({}, httpsRequestOptions, fwdFlatReq.headers);

        // format headers
        fwdFlatReq.headers = $utils.camelCaseAndDashHeaders(fwdFlatReq.headers, [], []);

        deferred.resolve(fwdFlatReq);

    }

    return deferred.promise;

}


function selectCacheForUrl (url) {

    var urlParts = url.split('/');

    return {
        key: urlParts[1],
        def: $caches.select(urlParts[1])
    };

}


function remainingUrlAfterCacheKey(url, cacheKey) {

    return url.substring(cacheKey.length + 2);

}
