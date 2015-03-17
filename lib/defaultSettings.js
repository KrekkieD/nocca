'use strict';

var $chainBuilderFactory = require('./chainBuilderFactory');
var $constants = require('./constants');
var $endpoints = require('./endpoints');
var $errors = require('./errors');
var $forwarder = require('./forwarder');
var $gui = require('./gui');
var $httpApi = require('./httpApi');
var $httpMessageFactory = require('./httpMessageFactory');
var $keys = require('./keys');
var $logger = require('./logger');
var $playback = require('./playback');
var $recorder = require('./recorder');
var $requestContextFactory = require('./requestContextFactory');
var $requestExtractor = require('./requestExtractor');
var $responder = require('./responder');
var $server = require('./server');
var $stats = require('./stats');
var $websocketServer = require('./websocketServer');

module.exports = {

    logger: $logger,

    delay: 500,
    endpoints: {},

    servers: {
        // Proxy config -- the essence of Nocca
        proxy: {
            // constructor function
            instance: $server,
            // TODO: you want it? you'd better, probably not configurable
            enabled: true,
            // On what port incoming requests should be expected
            port: 3003
        },
        // GUI for Nocca stats
        gui: {
            // constructor function
            instance: $gui,
            // You want it?
            enabled: true,
            // Where you want it?
            port: 3004
        },
        // HTTP Api for controlling your Nocca instance remotely
        httpApi: {
            // constructor function
            instance: $httpApi,
            // You want it?
            enabled: true,
            // Where you want it?
            port: 3005
        },
        // Websockets for sharing Nocca stats
        websocketServer: {
            // constructor function
            instance: $websocketServer,
            // You want it?
            enabled: true,
            // Wanna bitch about access rights? then set to false
            autoAcceptConnections: true,
            // Wanna share the httpApi server? Might as well right
            useHttpApiServer: true,
            // Where you want it?
            // Note!: this will only be used when useHttpApiServer === false
            port: 3005
        }
    },

    record: true,

    forward: $constants.FORWARDING_FORWARD_MISSING,

    requestContextFactory: $requestContextFactory,
    httpMessageFactory: $httpMessageFactory,

    requestExtractor: $requestExtractor,
    endpointManager: $endpoints,
    keyGenerator: $keys.defaultGenerator,
    playback: $playback,
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

    allowEndpointOverrides: {
        keyGenerator: true
    },

    scenarios: {
        available: [],
        writeNewScenarios: false,
        scenarioOutputDir: undefined
    }
};
