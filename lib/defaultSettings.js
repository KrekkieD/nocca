'use strict';

var nocca = require('../index');

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

    cacheSelector: nocca.$caches.defaultCacheSelector,
    keyGenerator: nocca.$keys.defaultGenerator,
    playback: {
        matcher: nocca.$playback.defaultRequestMatcher,
        recorder: nocca.$playback.addRecording,
        mocker: nocca.$recorder.defaultRecorder,
        exporter: nocca.$playback.exportRecordings,
        scenarioRecorder: nocca.$playback.addScenario,
        scenarioExporter: nocca.$playback.exportScenarios
    },
    requestForwarder: nocca.$forwarder.defaultForwarder,
    responder: nocca.$responder.defaultResponder,
    failureHandlerFactory: nocca.$errors.defaultFailureHandlerFactory,
    throwHandlerFactory: nocca.$errors.defaultThrowHandlerFactory,

    statistics: {
        processor: nocca.$stats.statisticsProcessor,
        exporter: nocca.$stats.statisticsExporter,
        reporter: nocca.$reporter
    },

    // TODO: this is a weird duck in the bite
    chainBuilderFactory: nocca.chainBuilderFactory,

    allowEndpointOverrides: {
        keyGenerator: true
    },

    scenarios: {
        available: [],
        writeNewScenarios: false,
        scenarioOutputDir: undefined
    }
};
