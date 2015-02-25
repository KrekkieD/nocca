'use strict';

module.exports = {};

var $server            = module.exports.server              = require('./lib/server');
var $caches            = module.exports.caches              = require('./lib/caches');
var $keys              = module.exports.keys                = require('./lib/keys');
var $playback          = module.exports.playback            = require('./lib/playback');
var $recorder          = module.exports.recorder            = require('./lib/recorder');
var $scenario          = module.exports.scenario            = require('./lib/scenario');
var $scenarioRecorder  = module.exports.scenarioRecorder    = require('./lib/scenarioRecorder');
var $forwarder         = module.exports.forwarder           = require('./lib/forwarder');
var $responder         = module.exports.responder           = require('./lib/responder');
var $reporter          = module.exports.reporter            = require('./lib/reporter');
var $httpInterface     = module.exports.httpInterface       = require('./lib/httpInterface');
var $gui               = module.exports.gui                 = require('./lib/gui');
var $stats             = module.exports.stats               = require('./lib/stats');
var $errors            = module.exports.errors              = require('./lib/errors');
                         module.exports.setup               = setup;
                         module.exports.chainBuilderFactory = defaultChainBuilderFactory;

var $extend            = require('extend');

var FORWARDING = module.exports.FORWARDING          = {
    FORWARD_ALL    : true,
    FORWARD_NONE   : false,
    FORWARD_MISSING: 'MISSING'
};

var defaultSettings = {
    
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

    chainBuilderFactory: defaultChainBuilderFactory,
    
    allowEndpointOverrides: {
        keyGenerator: true
    },
    
    scenarios: {
        available: [],
        writeNewScenarios: false,
        scenarioOutputDir: undefined
    }
};

function setup(customOptions) {

    var opts = $extend(true, {}, defaultSettings, customOptions);

    var cacheNames = Object.keys(opts.endpoints);
    for (var i = 0; i < cacheNames.length; i++) {
        $caches.newEndpoint(cacheNames[i], opts.endpoints[cacheNames[i]]);
    }
    
    for (var j = 0; j < opts.scenarios.available.length; j++) {
        $playback.addScenario(opts.scenarios.available[j].player());
    }
    
    $httpInterface(opts);
    $gui(opts);
    $server(opts, opts.chainBuilderFactory(opts));

}

function defaultChainBuilderFactory(opts) {
    
    // Create a keyGenerator that uses the default 
    var keyGenerator = (opts.allowEndpointOverrides.keyGenerator) ?
        $keys.overridableKeyGeneratorBuilder(opts.keyGenerator) :
        opts.keyGenerator;
    
    return function(context) {

        var requestChain = context.promise
            .then(opts.cacheSelector)
            .then(keyGenerator);
        
        if (opts.forward === FORWARDING.FORWARD_NONE || opts.forward === FORWARDING.FORWARD_MISSING) {
            // Either forwarding is off altogether, or set to forward MISSING requests only.
            // We will try to find a matching request to respond with
            requestChain = requestChain.then(opts.playback.matcher);
        }
        
        if (opts.forward === FORWARDING.FORWARD_ALL || opts.forward === FORWARDING.FORWARD_MISSING) {
            // Forwarding is on, either for all requests, or just MISSING requests.
            // The default forwarder will only forward a request if no pre-recorded response was found
            requestChain = requestChain.then(opts.requestForwarder);
        }
        
        // +---------------------------------------------------------------+
        // | Nocca Request/Response Barrier - From here there be Responses |
        // +---------------------------------------------------------------+
        
        if (opts.record) {
            // mocker will call opts.playback.recorder to store the mock
            requestChain = requestChain.then(opts.playback.mocker);
        }

        requestChain.then(opts.responder)
            // log mock stats
            .then(opts.statistics.processor)
            // TODO: make sure the failures are handled properly
            .fail(opts.failureHandlerFactory)
            // TODO: make sure thrown errors are handled properly
            .catch(opts.throwHandlerFactory(context.response))
            // broadcast current stats
            .then(opts.statistics.reporter)
            .finally(function() {
                console.log('|  Request processing ended');
            });
        
    };
    
}
