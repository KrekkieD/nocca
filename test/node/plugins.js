'use strict';

var $nocca = require('../../index');

new $nocca({
    endpoints: {
        google: {
            targetBaseUrl: 'http://www.google.com/'
        },
        yahoo: {
            targetBaseUrl: 'http://www.yahoo.com/',
            keyGenerator: 'keyGeneratorFactory',
            keyGeneratorFactoryMethod: 'urlAndHeadersKeyGeneratorBuilder'
        },
        self: {
            targetBaseUrl: 'http://localhost:8989/gui/'
        },
        bogi: {
            targetBaseUrl: 'http://localhost:8988/'
        },
        _default: {
            targetBaseUrl: 'http://localhost:3004/'
        }
    },
    keyGenerator: 'cherryPickingKeygen',
    requestKeyParams: {
        subject: 'proxyRequest',
        properties: ['path', 'method', 'host'],
        url: ['pathname'],
        query: ['login', 'password'],
        headers: ['accept', 'content-type', 'soapaction'],
        body: {
            xpath: ['//S:Body'],
            json: ['user.id']
        }
    }
});
