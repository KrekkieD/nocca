'use strict';

var Nocca = require('../../index');

var config = {
    endpoints: {
        google: {
            targetBaseUrl: 'http://www.google.com/'
        }
    }
};

new Nocca(config);
