'use strict';

var $nocca = require('../../index');

var Nocca = new $nocca({
    endpoints: {
        'google': {
            targetBaseUrl: 'http://www.google.com/'
        },
        'yahoo': {
            targetBaseUrl: 'http://www.yahoo.com/',
            keyGenerator: 'keyGeneratorFactory',
            keyGeneratorFactoryMethod: 'urlAndHeadersKeyGeneratorBuilder'
        },
        'bogi': {
            targetBaseUrl: 'http://localhost:8988/'
        },
        '_default': {
            targetBaseUrl: 'http://localhost:3004/'
        }
    },
    servers: {
        wrapperServer: {
            listen: {
                hostname: false,
                port: 8989
            }
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
