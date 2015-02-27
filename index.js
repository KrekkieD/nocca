'use strict';

var $extend = require('extend');

module.exports = nocca;

// use the $ prefix to indicate these properties may be used internally and shouldn't really be changed
nocca.$caches = require('./lib/caches');
nocca.$chainBuilderFactory = require('./lib/chainBuilderFactory');
nocca.$constants = require('./lib/constants');
nocca.$defaultSettings = require('./lib/defaultSettings');
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


