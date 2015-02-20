'use strict';

var $nocca2 = require('../index_v2');

var config = {
    endpoints: {
        'google': {
            targetBaseUrl: 'http://www.google.com/'
        }
    }
};

$nocca2.setup(config);