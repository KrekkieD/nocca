'use strict';

module.exports = {};

var $server    = module.exports.server    = require('./lib_v2/server');
var $caches    = module.exports.caches    = require('./lib_v2/caches');
var $keys      = module.exports.keys      = require('./lib_v2/keys');
var $playback  = module.exports.playback  = require('./lib_v2/playback');
var $recorder  = module.exports.recorder  = require('./lib_v2/recorder');
var $forwarder = module.exports.forwarder = require('./lib_v2/forwarder');
var $responder = module.exports.responder = require('./lib_v2/responder');
var $httpInterface = module.exports.httpInterface = require('./lib_v2/httpInterface');
var $stats     = module.exports.stats     = require('./lib_v2/stats');
var $errors    = module.exports.errors    = require('./lib_v2/errors');

module.exports.setup               = setup;
module.exports.chainBuilderFactory = defaultChainBuilderFactory;
module.exports.FORWARDING          = FORWARDING;

var FORWARDING = {
    FORWARD_ALL    : true,
    FORWARD_NONE   : false,
    FORWARD_MISSING: 'MISSING'
};

var $extend = require('extend');

var defaultSettings = {
    
    endpoints: {},
    
    proxyPort: 3003,
    controlPort: 3004,
    webSocketPort: 3005,
    
    record: true,
    // Values: true, false, MISSING
    forward: 'MISSING',
    
    cacheSelector: $caches.defaultCacheSelector,
    keyGenerator: $keys.defaultGenerator,
    requestMatcher: $playback.defaultRequestMatcher,
    requestForwarder: $forwarder.defaultForwarder,
    recorder: $recorder.defaultRecorder,
    responder: $responder.defaultResponder,
    failureHandler: $errors.defaultFailureHandler,
    throwHandlerFactory: $errors.defaultThrowHandlerFactory,
    statisticsProcessor: $stats.defaultStatisticsProcessor,
    statisticsReporter: $stats.defaultStatisticsReporter,
    chainBuilderFactory: defaultChainBuilderFactory
    
    
};

function setup(customOptions) {
    var opts = $extend({}, defaultSettings, customOptions);
    
    var cacheNames = Object.keys(opts.endpoints);
    for (var i = 0; i < cacheNames.length; i++) {
        $caches.newEndpoint(cacheNames[i], opts.endpoints[cacheNames[i]]);
    }
    
    $httpInterface(opts.controlPort);
    $server(opts.proxyPort, opts.chainBuilderFactory(opts));

}

function defaultChainBuilderFactory(opts) {
    
    return function(context) {
        
        var requestChain = context.promise.then(opts.cacheSelector)
            .then(opts.keyGenerator);
        
        if (opts.forward === FORWARDING.FORWARD_NONE || opts.forward === FORWARDING.FORWARD_MISSING) {
            // Either forwarding is off altogether, or set to forward MISSING requests only.
            // We will try to find a matching request to respond with
            requestChain = requestChain.then(opts.requestMatcher);
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
            requestChain = requestChain.then(opts.recorder);
        }
        
        requestChain.then(opts.responder)
            // log mock stats
            .then(opts.statisticsProcessor)
            .fail(opts.failureHandler)
            .catch(opts.throwHandlerFactory(context.response))
            // broadcast current stats
            .finally(opts.statisticsReporter);
        
    };
    
}