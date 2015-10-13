'use strict';

module.exports = {

    // configure the logger
    logger: {
        // application name
        name: 'Nocca',

        // level of logging, one of: fatal, error, warn, info, debug, trace.
        // log level will log that level and higher (i.e. 'info' would also log 'error' events, but not 'debug' events)
        level: 'info'
    },

    // specify a responseDelay plugin to delay responses
    responseDelay: undefined,

    // specify a cacheExtractor plugin to extract a cache from a requestContext
    cacheExtractor: 'cacheExtractor',

    endpointSelector: undefined,

    // specify a keyGenerator plugin to handle generating a requestKey
    keyGenerator: 'cherryPickingKeygen',

    // repositories that hold responses to be send to client
    repositories: [
        'cacheConglomerate',
        'cacheQueue'
    ],

    // configuration for the listening server
    server: process.env.VCAP_APP_PORT || 8989,

    // enable recording?
    record: true,

    // enable playback?
    playback: true,

    // set forwarding to true (always), false (never) or 'missing' (when no cache found)
    forward: 'missing'

};
