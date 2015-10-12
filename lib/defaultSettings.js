'use strict';

var $constants = require('./constants');

module.exports = {

    // specifies logging functions
    logger: {
        name: 'Nocca',
        level: 'info'
    },

    // specify a delay plugin to delay responses
    delay: undefined,

    // specifies proxying/forwarding configuration
    endpoints: {},

    // repositories that hold responses to be send to client
    repositories: [
        'cacheConglomerate',
        'cacheQueue'
    ],

    server: process.env.VCAP_APP_PORT || 8989,

    // record responses?
    record: true,

    // forward responses to endpoint url?
    forward: $constants.FORWARDING_FORWARD_MISSING,

    cacheExtractor: 'cacheExtractor',
    endpointSelector: 'endpointSelector',
    keyGenerator: 'cherryPickingKeygen',

    statistics: {
        mode: $constants.STATISTICS_LOG_MODE_REALTIME,
        // array of functions that will subscribe to changes in stats
        // will be called with Nocca instance as argument
        reporters: []
    },

    plugins: [
        'cacheConglomerate',
        'cacheExtractor',
        'cacheQueue',
        'cherryPickingKeygen',
        'distributedDelay',
        'endpointSelector',
        'keyGeneratorFactory',
        'reKeyCaches',
        'simpleMessageTransformer'
    ]
};
