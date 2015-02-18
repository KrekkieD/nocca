'use strict';

module.exports = {};
module.exports.proxy = createNewProxy


var $q = require('q');
var $constants = require('constants');
var $changeCase = require('change-case');

var url  = require('url');
var http = require('http');
var https = require('https');
var extend = require('extend');


var $caches = require('./caches');
var $recorder = require('./recorder');
//var $endpoints = require('./endpoints');

// set to false to disable logging in console
var verbose = true;

var logger = verbose ? console.log : function () {};

var defaultOptions = {
    port: 3003,
    record: true,
    replay: false,
    forward: true,
    logging: true
};

function createNewProxy(requestedOptions) {
    if (typeof requestedOptions == 'number') {
        requestedOptions = {port: requestedOptions};
    }
    var opts = extend({}, defaultOptions, requestedOptions);
    
    if (opts.logging) { logger('|  Creating new Proxy with options: ' + JSON.stringify(opts)); }

    http.createServer(function(req, res) {

        if (opts.logging)  { logger('|  Request: ' + req.url); }

        var requestKey = $recorder.defaultKeyGenerator(req);

        if ($recorder.isRecorded(requestKey)) {

            if (opts.replay) {
                if (opts.logging) { logger('|  Request hit! Pre-recorded response found, replaying ...'); }
                $recorder.respond(requestKey, res);
            }
            else if (opts.forward) {
                if (opts.logging) { logger('|  Request hit! Pre-recorded response found, replaying is off, forwarding ...')}
                getProxiedRequest(req)
                    .then(forwardAndRespond(req, res));
            }
            else {
                blockRequest(res);
                
            }

        }
        else {

            if (opts.forward) {
                // forward request and optionally record it
                if (opts.record) {
                    if (opts.logging) { logger('|  Forwarding request and recording response'); }

                    getProxiedRequest(req)
                        .then(function (proxiedReq) {

                            $recorder.createMockFromRequest(proxiedReq)
                                .then(function (mock) {

                                    // manipulate the mock headers
                                    mock.headers = formatHeaders(mock.headers, [], ['soapaction']);

                                    //logger(mock);

                                    logger('|    Target response captured');

                                    // save mock!
                                    logger('|    Saving response as mock');
                                    $recorder.saveMock(requestKey, mock);

                                    // respond to original request
                                    logger('|    Responding with fresh mock');
                                    $recorder.respond(requestKey, res);

                                });

                        }, function (err) {
                            res.writeHead(err.statusCode);
                            logger(err.body);
                            res.end();
                        });
                }
                else {
                    if (opts.logging) { logger('|  Forwarding request'); }
                    
                    getProxiedRequest(req)
                        .then(forwardAndRespond(req, res));
                }
            }
            else {
                // No matching request found, no forwarding allowed, returning error
                blockRequest(res);
            }
        }

    }).listen(opts.port);

    logger('Proxy listening on port ' + opts.port);

}

function forwardAndRespond(req, res) {

    return function (proxiedReq) {

        proxiedReq.on('response', function(proxiedRes) {

            res.writeHead(proxiedRes.statusCode, proxiedRes.headers);
            proxiedRes.on('data', function(chunk){
                res.write(chunk);
            });

            proxiedRes.on('end', function() {
                res.end();
                console.log('done');
            });

            proxiedRes.on('error', function(err) {
                req.abort(err);
                res.end();
            });

        });

    };

}

function blockRequest(res) {
    if (opts.logging) { logger('|  '); }
    res.writeHead(501, {'Nocca-Error': '"Unable to either forward the request or replay a response"'});
    res.end();


}

function getProxiedRequest (req) {

    var deferred = $q.defer();

    /* Default options for HTTPS requests */
    var httpsRequestOptions = {
        secureOptions: $constants.SSL_OP_NO_TLSv1_2,
        ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
        honorCipherOrder: true
    };

    var cache = selectCacheForUrl(req.url);

    if (!cache.def) {
        deferred.reject({
            statusCode: '404',
            body: 'No cache URL found for ' + req.url
        });
    }
    else {

        var resolvedUrl = url.resolve(cache.def.targetBaseUrl, remainingUrlAfterCacheKey(req.url, cache.key));

        var targetUrl = url.parse(resolvedUrl);
        var isTargetHttps = targetUrl.protocol === 'https:';

        var options = extend(httpsRequestOptions, {
            host: targetUrl.hostname,
            path: targetUrl.path,
            method: req.method,
            headers: extend(buildForwardedHeaders(req.headers), {
                'Host': targetUrl.hostname
            })
        });

        var requestProvider = (isTargetHttps ? https : http);

        req.on('data', function (data) {
            // add request body if not exists
            options.body = options.body || '';

            options.body += data;

            // Too much POST data, kill the connection!
            if (options.body.length > 1e6) {
                req.connection.destroy();
                deferred.reject({
                    status: 400,
                    body: 'Request body data size overflow. Not accepting request bodies larger than ' + (1e6) + ' bytes'
                });
            }
        });


        req.on('end', function () {

            var proxiedRequest = requestProvider.request(options);
            deferred.resolve(proxiedRequest);

            if (typeof options.body !== 'undefined') {
                proxiedRequest.write(options.body, function() {
                    proxiedRequest.end();
                });
            }
            else {
                proxiedRequest.end();
            }

        });

    }

    return deferred.promise;

}

function selectCacheForUrl(url) {

    var urlParts = url.split('/');

    return {
        key: urlParts[1],
        def: $caches.select(urlParts[1])
    };

}

function remainingUrlAfterCacheKey(url, cacheKey) {

    return url.substring(cacheKey.length + 2);

}

function buildForwardedHeaders (rawHeaders) {

    // The HTTP module transforms all header names to lower case during 'header normalization'.
    // This makes matching easier and less error prone.
    var skipHeaders = [
        'host'
    ];
    var dontFormatHeaders = [
        'soapaction'
    ];

    return formatHeaders(rawHeaders, skipHeaders, dontFormatHeaders);

}

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