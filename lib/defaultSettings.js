'use strict';

var $cacheEntryRepository = require('./cacheEntryRepository');
var $chainBuilderFactory = require('./chainBuilderFactory');
var $constants = require('./constants');
var $endpoints = require('./endpoints');
var $errors = require('./errors');
var $forwarder = require('./forwarder');
var $gui = require('./gui');
var $httpApi = require('./httpApi');
var $httpMessageFactory = require('./httpMessageFactory');
var $logger = require('./logger');
var $playback = require('./playback');
var $recorder = require('./recorder');
var $requestContextFactory = require('./requestContextFactory');
var $requestExtractor = require('./requestExtractor');
var $responder = require('./responder');
var $scenarioRepository = require('./scenarioRepository');
var $scenario = require('./scenario');
var $proxy = require('./proxy');
var $stats = require('./stats');
var $websocketServer = require('./websocketServer');
var $wrapperServer = require('./wrapperServer');

module.exports = {

    // specifies logging functions
    logger: $logger,

    // specify a delay plugin to delay responses
    delay: undefined,

    // specifies proxying/forwarding configuration
    endpoints: {},

    // repositories that hold responses to be send to client
    repositories: ['cacheConglomerate', 'cacheQueue', $scenarioRepository],

    // config for the various running webservers
    servers: {

        // wraps other servers into one single server using path prefixes instead of ports
		wrapperServer: {
			// constructor function
			instance: $wrapperServer,
			// You want it?
			enabled: true,
			// Where you want it?
			listen: {
				hostname: 'localhost',
				port: '8989'
			}
		},
        // Proxy config -- the essence of Nocca
        proxy: {
            // constructor function
            instance: $proxy,
            // you want it? you'd better, probably not configurable
            enabled: true,
            // On what port incoming requests should be expected
			listen: {
				hostname: 'localhost',
				port: 3003
			},
			wrapper: {
				// If you use the wrapper server, on which contextRoot would you like this server?
				path: '/proxy'
			}

        },
        // GUI for Nocca
        gui: {
            // constructor function
            instance: $gui,
            // You want it?
            enabled: true,
            // Where you want it?
			listen: {
				hostname: 'localhost',
				port: 3004
			},
			wrapper: {
				// If you use the wrapper server, on which contextRoot would you like this server?
				path: '/gui'
			}

        },
        // HTTP Api for controlling your Nocca instance remotely
        httpApi: {
            // constructor function
            instance: $httpApi,
            // You want it?
            enabled: true,
            // Where you want it?
			listen: {
				hostname: 'localhost',
				port: 3005
			},
			wrapper: {
				// If you use the wrapper server, on which contextRoot would you like this server?
				path: '/http-api'
			}

        },
        // Websockets for sharing Nocca stats
        websocketServer: {
            // constructor function
            instance: $websocketServer,
            // You want it?
            enabled: true,
			// websocket module config
			options: {
				autoAcceptConnections: true,
				disableNagleAlgorithm: false
			},
            // Wanna bitch about access rights? then set to false
            autoAcceptConnections: true,
			// Wanna share the wrapper server?
			useWrapperServer: true,
            // Wanna share the httpApi server?
            useHttpApiServer: false,
            // Where you want it?
            // Note!: this will only be used when useHttpApiServer === false
			listen: {
				hostname: 'localhost',
				port: 3005
			},
			wrapper: {
				// If you use the wrapper server, on which contextRoot would you like this server?
				path: '/socket'
			}
        }
    },

    // record responses?
    record: true,

    // forward responses to endpoint url?
    forward: $constants.FORWARDING_FORWARD_MISSING,

    requestContextFactory: $requestContextFactory,
    httpMessageFactory: $httpMessageFactory,

    requestExtractor: $requestExtractor,
    endpointManager: $endpoints,
    keyGenerator: 'keyGeneratorFactory',
    playback: $playback,
    forwarder: $forwarder,
    responder: $responder,
    recorder: $recorder,
    errorHandler: $errors,
    scenario: $scenario,

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

    scenarios: {
        available: [],
        writeNewScenarios: false,
        scenarioOutputDir: undefined
    },
    plugins: [
        'cherryPickingKeygen',
        'keyGeneratorFactory',
        'distributedDelay',
        'cacheQueue',
        'cacheConglomerate'
    ]
};
