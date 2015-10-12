'use strict';

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

    var self = this;

    self.logger = Nocca.logger.child({ module: 'Forwarder' });

    return handleRequest;

    /**
     * Called for each incoming request to Nocca Proxy. It sets up the promise chain with all configured components.
     *
     * This handler creates a chain running the following plugins in order:
     * * requestExtractor
     * * endpointSelector
     * * keyGenerator
     * * cacheentries.matcher (if forwarding is off or only on for missing requests)
     * * requestForwarder (if forwarding is on or only on for missing requests)
     * * cacheentries.mocker  (if recording is on)
     * * responder
     * * statsLogger
     *
     * In addition it also registers a failureHandler and a throwHandler for the case where things go wrong inside the chain.
     *
     * @param requestContextPromise the request context promise created by the server
     * @param reqContext the request context created by the server
     */
    function handleRequest (requestContextPromise, reqContext) {

        return requestContextPromise
            .then(Nocca.endpointSelector)
            .then(Nocca.requestExtractor)
            .then(Nocca.forwarder.prepareProxyRequest)
            .then(reqContext.generateKey)
            .then(reqContext.replayIfDesired)
            .then(reqContext.forwardIfDesired)
            .then(reqContext.recordIfDesired)
            .then(Nocca.responder.respond)
            .fail(function (err) {

                // err could be reqContext or an actual error, handle accordingly
                if (err !== reqContext) {
                    reqContext.error = err;
                }

                return Nocca.errorHandler.chainRejected(reqContext);

            })
            .finally(function () {
                Nocca.statsLogger.log(reqContext);
                self.logger.debug('Request chain ended');
                self.logger.debug('Timestamp: ' + new Date().getTime());
            });

    }

}
