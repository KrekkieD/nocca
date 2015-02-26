'use strict';

var $extend = require('extend');

module.exports = nocca;

// use the $ prefix to indicate these properties may be used internally and shouldn't really be changed
nocca.$caches = require('./lib/caches');
nocca.$constants = require('./lib/constants');
nocca.$errors = require('./lib/errors');
nocca.$forwarder = require('./lib/forwarder');
nocca.$gui = require('./lib/gui');
nocca.$httpInterface = require('./lib/httpInterface');
nocca.$keys = require('./lib/keys');
nocca.$playback = require('./lib/playback');
nocca.$recorder = require('./lib/recorder');
nocca.$reporter = require('./lib/reporter');
nocca.$responder = require('./lib/responder');
nocca.$scenario = require('./lib/scenario');
nocca.$scenarioRecorder = require('./lib/scenarioRecorder');
nocca.$server = require('./lib/server');
nocca.$stats = require('./lib/stats');
nocca.$utils = require('./lib/utils');

nocca.chainBuilderFactory = defaultChainBuilderFactory;


// this one is down here so all other requires can complete first -- defaultSettings reads from nocca obj
nocca.$defaultSettings = require('./lib/defaultSettings');


function nocca (customOptions) {

    var opts = $extend(true, {}, nocca.$defaultSettings, customOptions);

    var cacheNames = Object.keys(opts.endpoints);
    for (var i = 0; i < cacheNames.length; i++) {
        nocca.$caches.newEndpoint(cacheNames[i], opts.endpoints[cacheNames[i]]);
    }

    for (var j = 0; j < opts.scenarios.available.length; j++) {
        nocca.$playback.addScenario(opts.scenarios.available[j].player());
    }

    nocca.$httpInterface(opts);
    nocca.$gui(opts);
    nocca.$server(opts, opts.chainBuilderFactory(opts));

}

function defaultChainBuilderFactory(opts) {

    // Create a keyGenerator that uses the default
    var keyGenerator = (opts.allowEndpointOverrides.keyGenerator) ?
        nocca.$keys.overridableKeyGeneratorBuilder(opts.keyGenerator) :
        opts.keyGenerator;

    return function(context) {

        var requestChain = context.promise
            .then(opts.cacheSelector)
            .then(keyGenerator);

        if (opts.forward === nocca.$constants.FORWARD_NONE || opts.forward === nocca.$constants.FORWARD_MISSING) {
            // Either forwarding is off altogether, or set to forward MISSING requests only.
            // We will try to find a matching request to respond with
            requestChain = requestChain.then(opts.playback.matcher);
        }

        if (opts.forward === nocca.$constants.FORWARD_ALL || opts.forward === nocca.$constants.FORWARD_MISSING) {
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
