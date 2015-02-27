'use strict';

module.exports = reporter;

/**
 * This is an example of how to write a reporter. No longer required for our own app.
 */
function reporter (Nocca) {

    Nocca.pubsub.subscribe('PUBSUB_STATS_UPDATED', function (stats) {



    });

}