'use strict';

var $constants = require('./constants');
var $keys = require('./keys');

module.exports = ChainBuilderFactory;

/**
 * This ChainBuilderFactory is the default component used to handle proxy requests initiated by the Nocca.server module.
 * It provides each created request context with a chain of components which will perform various tasks to complete an
 * run through the proxy.
 * 
 * You can override this component with a module of your own. Create module which can be initialized with a Nocca instance and
 * have it return a function that accepts a request context. Any return value of the handler will be ignored.
 *   
 * @param Nocca the Nocca instance whose configuration should be used setting up the server.
 * @returns {handleRequest} this function accepts a request context object created by the Nocca.server module.
 *   It registers the different components in the right order to create a promise chain to handle the request. 
 * @constructor Instantiates a ChainBuilderFactory which uses the current Nocca configuration.
 */
function ChainBuilderFactory (Nocca) {


    // If it is allowed to override the keyGenerator per endpoint, we wrap the supplied default keyGenerator with one that checks the endpoint configuration first
    var keyGenerator = (Nocca.config.allowEndpointOverrides.keyGenerator) ?
        $keys.overridableKeyGeneratorBuilder(Nocca.config.keyGenerator) :
        Nocca.config.keyGenerator;

    return handleRequest;

    /**
     * Called for each incoming request to Nocca Proxy. It sets up the promise chain with all configured components.
     * 
     * This handler creates a chain running the following plugins in order:
     * * endpointSelector
     * * keyGenerator
     * * playback.matcher (if forwarding is off or only on for missing requests)
     * * requestForwarder (if forwarding is on or only on for missing requests)
     * * playback.mocker  (if recording is on)
     * * responder
     * * statsLogger
     * 
     * In addition it also registers a failureHandler and a throwHandler for the case where things go wrong inside the chain.
     *
     * @param context the request context created by the server. Must contain a promise and an HTTP service.
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