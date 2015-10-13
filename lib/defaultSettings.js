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

    // specify an endpointSelector plugin to handle endpoint selection
    endpointSelector: 'endpointSelector',

    // specify a keyGenerator plugin to handle generating a requestKey
    keyGenerator: 'cherryPickingKeygen',

    // specifies proxying/forwarding configuration
    endpoints: {},

    // repositories that hold responses to be send to client
    repositories: [
        'cacheConglomerate',
        'cacheQueue'
    ],

    // configuration for the listening server. This can be:
    // - the port number
    // - an array of arguments [port, hostname, backlog]
    //      see: https://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback
    //      the last argument (callback) is provided by Nocca
    server: process.env.VCAP_APP_PORT || 8989,

    // true or false, when true a response will be recorded in the specified repositories.
    // All responses will be recorded (including responses served from a cache)
    record: true,

    playback: true,

    // true, false or 'MISSING'. Determines when a request should be sent to the endpoint server:
    // - true, always forward, never serve from cache
    // - false, never forward, always serve from cache
    // - 'missing', forward when no cache was found
    forward: 'missing'

};
