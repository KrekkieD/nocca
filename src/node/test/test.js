'use strict';

var $nocca = require('../index');

var $recorder = $nocca.recorder;


var $q = require('q');
var $constants = require('constants');
var $changeCase = require('change-case');

var url  = require('url');
var http = require('http');
var https = require('https');
var extend = require('extend');


var $endpoints = {
    'google': {
        targetBaseUrl: 'https://www.google.com/'
    },
    'MyA_CustomerApi_OAuth': {
        targetBaseUrl: 'https://api.ute2.klm.com/customerapi/'
    },
    'MyA_CustomerApi_Customer': {
        targetBaseUrl: 'https://api.ute2.klm.com/customerapi/'
    },
    'MyA_CustomerApi_Customers': {
        targetBaseUrl: 'https://api.ute2.klm.com/customerapi/'
    },
    'MyA_cpsdeleteaccount_000562v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cmscontent_v11': {
        'targetBaseUrl': 'https://services.ute1.klm.com/passenger/contentmanagement/CMS/'
    },
    'MyA_cpscreatepayment_000470v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_traveldb_listValueDouments_001075v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsprovidegin_000422v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsprovidesecret_000544v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpschecksecretanswer_000545v02': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_isisprovidemileagesummary_000462v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsupdateconnection_000433v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_isisprovidefbcommunicationlanguage_000524v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsdeletepayment_000471v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsprovide_000423v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsupdate_000443v02': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_osirishandleretroclaim_000888v01': {
        'targetBaseUrl': 'https://ws-qvi-dev.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsenroll_000431v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_geo_WSGeography': {
        'targetBaseUrl': 'https://services.ute3.klm.com/passenger/geography7/'
    },
    'MyA_cpsauthenticate_000420v02': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_mytrip_listFlightReservations_v20': {
        'targetBaseUrl': 'https://ws-qvi-dev.airfrance.fr/passenger/mytrip/listFlightReservations/'
    },
    'MyA_epasspayment_PaymentService': {
        'targetBaseUrl': 'https://services.ute1.klm.com/passenger/payment/PaymentService/'
    },
    'MyA_cpsgeneratepassword_000439v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsprovidepayment_000469v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_osiristransferofflyingbluemiles_000530v02': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_osirislistngo_001006v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'Mya_CustomerApi_TestCustomerid': {
        'targetBaseUrl': 'https://api.ute2.klm.com/testcustomerid/'
    },
    'MyA_Crisp_Verify': {
        'targetBaseUrl': 'https://www.ite1.klm.com/ams/crisp/'
    },
    'MyA_Crisp_Logon': {
        'targetBaseUrl': 'https://www.ite1.klm.com/ams/crisp/'
    },
    'MyA_fbenroll_EnrollFBActionV2do': {
        'targetBaseUrl': 'https://b2c3evol3rct.airfrance.fr/FR/fr/local/myaccount/flyingblue/'
    },
    'MyA_Crisp_Logoff': {
        'targetBaseUrl':  'https://www.ite1.klm.com/ams/crisp/'
    },
    'Mya_CustomerApi_TestCustomers': {
        'targetBaseUrl': 'https://api.ute2.klm.com/testcustomers/'
    },
    'MyA_fbupgrade_UpgradeToFBActionV2do': {
        'targetBaseUrl': 'https://b2c3evol3rct.airfrance.fr/FR/fr/local/myaccount/flyingblue/'
    }
};


// set to false to disable logging in console
var verbose = true;

var logger = verbose ? console.log : function () {};

http.createServer(function(req, res) {

    logger('\nRequest: ' + req.url);

    var requestKey = $recorder.defaultKeyGenerator(req);

    if ($recorder.isRecorded(requestKey)) {

        logger('|  Request hit! Pre-recorded, responding with mock from cache');
        $recorder.respond(requestKey, res);

    }
    else {

        // record and respond
        logger('|  Request miss! New, passing through to target');

        getProxiedRequest(req)
            .then(function (proxiedReq) {

                logger('|  Request fully received');

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

                    }, function (err) {

                        logger('|    Error when forwarding request');


                    });

            }, function (err) {
                res.writeHead(err.statusCode);
                logger('fail');
                logger(err.body);
                res.end();
            });

    }

}).listen(3003);

logger('Stubmachine listening on port 3003');

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
                proxiedRequest.write(options.body, function () {
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
        def: $endpoints[urlParts[1]]
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