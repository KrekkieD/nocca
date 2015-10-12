'use strict';

var $upTheTree = require('up-the-tree');
var $nocca = require($upTheTree());

var $http = require('http');
var $url = require('url');

var nocca = new $nocca({
    endpoints: {
        google: {
            targetBaseUrl: 'https://www.google.com/com'
        },
        '/googly/ding': {
            targetBaseUrl: 'https://www.google.co.uk/co.uk'
        },
        _default: {
            targetBaseUrl: 'https://www.google.nl/nl'
        }
    }
});

var exampleRequests = [
    'http://localhost:8989/proxy/google/ding',
    'http://localhost:8989/proxy/googly/ding/dong',
    'http://localhost:8989/proxy/goggle/ding'
];

exampleRequests.forEach(function (url) {

    var req = $http.request($url.parse(url), function (res) {

        var buffer = [];
        res.on('data', function (chunk) {
            buffer.push(chunk);
        });

        res.on('end', function () {
            setTimeout(function () {

                console.log('');
                console.log('Request', url, 'received:');
                console.log(Buffer.concat(buffer).toString().split('</style>').pop());

            }, 500);

        });

    });

    req.end();

});
