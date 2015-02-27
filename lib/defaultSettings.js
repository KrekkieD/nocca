'use strict';

var $caches = require('./caches');
var $chainBuilderFactory = require('./chainBuilderFactory');
var $errors = require('./errors');
var $forwarder = require('./forwarder');
var $keys = require('./keys');
var $playback = require('./playback');
var $recorder = require('./recorder');
var $reporter = require('./reporter');
var $responder = require('./responder');
var $stats = require('./stats');

module.exports = {

    endpoints: {},

    proxyPort: 3003,
    gui: {
        enabled: true,
        port: 3004
    },
    server: {
        port: 3005,
        websocketServer: true,
        httpApi: true
    },

    record: true,
    // Values: true, false, MISSING
    forward: 'MISSING',

    cacheSelector: $caches.defaultCacheSelector,
    keyGenerator: $keys.defaultGenerator,
    playback: {
        matcher: $playback.defaultRequestMatcher,
        recorder: $playback.addRecording,
        mocker: $recorder.defaultRecorder,
        exporter: $playback.exportRecordings,
        scenarioRecorder: $playback.addScenario,
        scenarioExporter: $playback.exportScenarios
    },
    requestForwarder: $forwarder.defaultForwarder,
    responder: $responder.defaultResponder,
    failureHandlerFactory: $errors.defaultFailureHandlerFactory,
    throwHandlerFactory: $errors.defaultThrowHandlerFactory,

    statistics: {
        processor: $stats.statisticsProcessor,
        exporter: $stats.statisticsExporter,
        reporter: $reporter
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
