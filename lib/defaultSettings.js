'use strict';

var $chainBuilderFactory = require('./chainBuilderFactory');
var $constants = require('./constants');
var $errors = require('./errors');
var $forwarder = require('./forwarder');
var $httpMessageFactory = require('./httpMessageFactory');
var $logger = require('./logger');
var $recorder = require('./recorder');
var $requestContextFactory = require('./requestContextFactory');
var $requestExtractor = require('./requestExtractor');
var $responder = require('./responder');
var $stats = require('./stats');

module.exports = {

    // specifies logging functions
    logger: $logger,

    // specify a delay plugin to delay responses
    delay: undefined,

    // specifies proxying/forwarding configuration
    endpoints: {},

    // repositories that hold responses to be send to client
    repositories: ['cacheConglomerate', 'cacheQueue'],

    server: {
        port: process.env.VCAP_APP_PORT || 8989
    },

    // record responses?
    record: true,

    // forward responses to endpoint url?
    forward: $constants.FORWARDING_FORWARD_MISSING,

    requestContextFactory: $requestContextFactory,
    httpMessageFactory: $httpMessageFactory,

    cacheExtractor: 'cacheExtractor',
    requestExtractor: $requestExtractor,
    endpointSelector: 'endpointSelector',
    keyGenerator: 'cherryPickingKeygen',
    forwarder: $forwarder,
    responder: $responder,
    recorder: $recorder,
    errorHandler: $errors,

    statistics: {
        // choose logging mode, choose wisely for load test performance
        // TODO: lazy mode not yet implemented
        mode: $constants.STATISTICS_LOG_MODE_REALTIME,
        // constructor function
        instance: $stats,
        // array of functions that will subscribe to changes in stats
        // will be called with Nocca instance as argument
        reporters: []
    },

    chainBuilderFactory: $chainBuilderFactory,

    plugins: [
        'cherryPickingKeygen',
        'keyGeneratorFactory',
        'distributedDelay',
        'cacheQueue',
        'cacheConglomerate',
        'simpleMessageTransformer',
        'scenarioRepository',
		'endpointSelector',
		'reKeyCaches',
        'cacheExtractor'
    ]
};
