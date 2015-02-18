'use strict';

module.exports = {};
module.exports.proxy = createNewProxy;

var $q = require('q');
var $constants = require('constants');
var $changeCase = require('change-case');

var url  = require('url');
var http = require('http');
var https = require('https');
var extend = require('extend');


var $caches = require('./caches');
var $recorder = require('./recorder');

// set to false to disable logging in console
var verbose = true;

var logUtility = verbose ? console.log : function () {};

var defaultOptions = {
    port: 3003,
    record: true,
    // false, true, 'MISSING'
    forward: 'MISSING',
    logging: true
};

function createNewProxy (requestedOptions) {

    if (typeof requestedOptions == 'number') {
        requestedOptions = {port: requestedOptions};
    }

    // todo: would be nice to mix in endpoint specific config, i.e. record the google.com endpoint, but not bing.com
    var opts = extend({}, defaultOptions, requestedOptions);

    var logger = opts.logging ? logUtility : function () {};

    logger('|  Creating new Proxy with options: ' + JSON.stringify(opts));

    http.createServer(function(req, res) {

        logger('|  Request: ' + req.url);

        // TODO: need to wait for req.end before we can generate a key that also takes req body into account!
        // TODO: key gen should be specified in config (either as default or overridden per endpoint)
        var requestKey = $recorder.defaultKeyGenerator(req);

        // either always forward, or only forward for unknown requestKeys if opts.forward === 'missing'
        if (opts.forward === true ||
            (opts.forward.toUpperCase() === 'MISSING' && !$recorder.isRecorded(requestKey))) {

            transformRequestIntoMock(req)
                .then(function (mock) {

                    logger('|    Target response captured');

                    // manipulate the mock headers
                    // TODO: this is actually implementation specific. create hook in (endpoint)config?
                    mock.headers = formatHeaders(mock.headers, [], ['soapaction']);

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
        // not forwarding or mock was already found! that means we serve from CACHE or DIE
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

    }).listen(opts.port);

    logger('Proxy listening on port ' + opts.port);

}

function transformRequestIntoMock (req) {

    // promise magic here. Give request, receive mock. Such wow.
    return getProxiedRequest(req)
        .then($recorder.recordRequest);

}

function blockRequest (res) {
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
