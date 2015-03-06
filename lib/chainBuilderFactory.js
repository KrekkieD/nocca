'use strict';

var $constants = require('./constants');
var $keys = require('./keys');

module.exports = defaultChainBuilderFactory;

function defaultChainBuilderFactory (Nocca) {


    // Create a keyGenerator that uses the default
    var keyGenerator = (Nocca.config.allowEndpointOverrides.keyGenerator) ?
        $keys.overridableKeyGeneratorBuilder(Nocca.config.keyGenerator) :
        Nocca.config.keyGenerator;

    return handleRequest;

    /**
     * Called for each incoming request to Nocca Proxy
     *
     * Context is a wrapper containing a promise
     */
    function handleRequest (context) {

        var requestChain = context.promise
            .then(Nocca.endpointManager.endpointSelector)
            .then(keyGenerator);

        if (Nocca.config.forward === $constants.FORWARDING_FORWARD_NONE ||
            Nocca.config.forward === $constants.FORWARDING_FORWARD_MISSING) {

            // Either forwarding is off altogether, or set to forward MISSING requests only.
            // We will try to find a matching request to respond with
            requestChain = requestChain.then(Nocca.config.playback.matcher);
        }

        if (Nocca.config.forward === $constants.FORWARDING_FORWARD_ALL ||
            Nocca.config.forward === $constants.FORWARDING_FORWARD_MISSING) {

            // Forwarding is on, either for all requests, or just MISSING requests.
            // The default forwarder will only forward a request if no pre-recorded response was found
            // TODO: then the default forwarder is wrong -- should respect config setting
            requestChain = requestChain.then(Nocca.config.requestForwarder);
        }

        // +---------------------------------------------------------------+
        // | Nocca Request/Response Barrier - From here there be Responses |
        // +---------------------------------------------------------------+

        if (Nocca.config.record) {
            // mocker will call Nocca.config.playback.recorder to store the mock
            requestChain = requestChain.then(Nocca.config.playback.mocker);
        }

        requestChain.then(Nocca.responder.respond)
            .fail(Nocca.config.failureHandlerFactory)
            // log mock stats
            .then(Nocca.statsLogger.log)
            // TODO: make sure thrown errors are handled properly
            .catch(Nocca.config.throwHandlerFactory(context.response))

            .finally(function() {
                Nocca.logDebug('|  Request chain ended');
                Nocca.logDebug('|  Timestamp: ' + new Date().getTime());
            });

    }

}