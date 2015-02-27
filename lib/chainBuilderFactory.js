'use strict';

var $constants = require('./constants');
var $keys = require('./keys');

module.exports = defaultChainBuilderFactory;

function defaultChainBuilderFactory(opts) {

    // Create a keyGenerator that uses the default
    var keyGenerator = (opts.allowEndpointOverrides.keyGenerator) ?
        $keys.overridableKeyGeneratorBuilder(opts.keyGenerator) :
        opts.keyGenerator;

    return function(context) {

        var requestChain = context.promise
            .then(opts.cacheSelector)
            .then(keyGenerator);

        if (opts.forward === $constants.FORWARDING_FORWARD_NONE ||
            opts.forward === $constants.FORWARDING_FORWARD_MISSING) {

            // Either forwarding is off altogether, or set to forward MISSING requests only.
            // We will try to find a matching request to respond with
            requestChain = requestChain.then(opts.playback.matcher);
        }

        if (opts.forward === $constants.FORWARDING_FORWARD_ALL ||
            opts.forward === $constants.FORWARDING_FORWARD_MISSING) {

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