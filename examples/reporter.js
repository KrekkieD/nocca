'use strict';

var Nocca = require('../index');

/**
 * This is an example of how to write a reporter. No longer required for our own app.
 */
function reporter (Nocca) {

    console.log('registering listener');

    Nocca.pubsub.subscribe(Nocca.constants.PUBSUB_STATS_UPDATED, function (stats) {

        console.log('Receiving stats');
        console.log(stats);

    });

}

new Nocca({
    statistics: {
        reporters: [
            reporter
        ]
    }
});
