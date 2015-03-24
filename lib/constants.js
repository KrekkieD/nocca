'use strict';

module.exports = {
    FORWARDING_FORWARD_ALL    : true,
    FORWARDING_FORWARD_NONE   : false,
    FORWARDING_FORWARD_MISSING: 'MISSING',

    PUBSUB_STATS_UPDATED: 'PUBSUB_STATS_UPDATED',
    PUBSUB_REST_ROUTE_ADDED: 'PUBSUB_REST_ROUTE_ADDED',

    STATISTICS_LOG_MODE_REALTIME: 'STATISTICS_LOG_MODE_REALTIME',
    STATISTICS_LOG_MODE_LAZY: 'STATISTICS_LOG_MODE_LAZY',
    STATISTICS_LOG_MODE_OFF: 'STATISTICS_LOG_MODE_OFF',

    ERRORS: {
        // Generic errors: 1xxx
        INCOMPLETE_OBJECT: 1001,
        
        // Playback errors: ....
        
        // Recorder errors: 4xxx
        
        ALREADY_RECORDING: 4001,
        NOT_RECORDING: 4002,

        NO_ENDPOINT_FOUND: 'NO_ENDPOINT_FOUND',
        NO_RESPONSE_FOUND: 'NO_RESPONSE_FOUND',

        FORWARDER_REQUEST_ERROR: 'FORWARDER_REQUEST_ERROR'
        
    },

    RepositoryType: {
        SCENARIOS: 'SCENARIOS',
        CACHES: 'CACHES'
    },
    Scenarios: {
        Repeatability: {
            ONE_SHOT: 1,
            INFINITE: -1
        },
        Type: {
            SEQUENTIAL: 'SEQUENTIAL'
        }
    }
};