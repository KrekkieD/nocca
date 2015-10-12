'use strict';

var $nocca = require('../../index');

var Nocca = new $nocca({
    endpoints: {
        google: {
            targetBaseUrl: 'http://www.google.com/'
        },
        yahoo: {
            targetBaseUrl: 'http://www.yahoo.com/',
            keyGenerator: 'keyGeneratorFactory',
            keyGeneratorFactoryMethod: 'urlAndHeadersKeyGeneratorBuilder'
        },
        _default: {
            targetBaseUrl: 'http://localhost:3004/'
        }
    },
    keyGenerator: 'cherryPickingKeygen',
    requestKeyParams: {
        properties: ['path', 'method'],
        url: ['pathname'],
        query: ['login', 'password'],
        headers: ['accept', 'content-type', 'soapaction'],
        body: {
            xpath: ['//S:Body'],
            json: ['user.id']
        }
    },
    plugins: [
        'cherryPickingKeygen',
        {
            interface: 'keyGenerator',
            id: 'cherryPickingKeygen',
            constructor: function () {}
        }
    ]
});
