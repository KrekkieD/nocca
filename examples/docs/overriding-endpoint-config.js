'use strict';

var $upTheTree = require('up-the-tree');
var $nocca = require($upTheTree());
var $q = require('q');

var $http = require('http');
var $url = require('url');

new $nocca({
    logger: { level: 'fatal' },

    // global settings
    record: true,
    forward: true,

    endpointSelector: [
        'endpointSelector',
        {
            google: {
                targetBaseUrl: 'https://www.google.com/com'
            },
            '/googly/ding': {
                // disable forwarding for this endpoint
                forward: false,
                targetBaseUrl: 'https://www.google.co.uk/co.uk'
            },
            _default: {
                // disable recording for this endpoint
                record: false,
                targetBaseUrl: 'https://www.google.nl/nl'
            }
        }
    ]
});

var exampleRequests = [
    'http://localhost:8989/proxy/google/ding',
    'http://localhost:8989/proxy/googly/ding/dong',
    'http://localhost:8989/proxy/goggle/ding'
];

var deferreds = [];

exampleRequests.forEach(function (url) {

    var deferred = $q.defer();

    deferreds.push(deferred.promise);

    var req = $http.request($url.parse(url), function (res) {

        var buffer = [];
        res.on('data', function (chunk) {
            buffer.push(chunk);
        });

        res.on('end', function () {
            setTimeout(function () {

                console.log('');
                console.log('Request', url, 'received:');
                var body = Buffer.concat(buffer).toString();
                if (body.indexOf('</style>') > -1) {
                    console.log(body.split('</style>').pop());
                }
                else {
                    console.log('statusCode', res.statusCode);
                }

                deferred.resolve();

            }, 500);

        });

    });

    req.end();

});

$q.allSettled(deferreds)
    .then(function () {
        process.exit();
    });
