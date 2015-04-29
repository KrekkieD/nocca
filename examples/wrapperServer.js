'use strict';

var $nocca = require('../index');

new $nocca({

    endpoints: {
        _default: {
            targetBaseUrl: 'http://www.google.com'
        }
    },
    servers: {
        gui: {
            listen: false,
            wrapper: {
                path: '/gui-path'
            }
        },
        websocketServer: {
            listen: false,
            wrapper: {
                path: '/'
            }
        },
        httpApi: {
            listen: false,
            wrapper: {
                path: '/api-path'
            }
        },
        proxy: {
            listen: false,
            wrapper: {
                path: '/proxy-path'
            }
        }
    }

});