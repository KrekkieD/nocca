'use strict';

var $extend = require('extend');

module.exports = constructor;

constructor.$caches = require('./lib/caches');
constructor.$chainBuilderFactory = require('./lib/chainBuilderFactory');
constructor.$constants = require('./lib/constants');
constructor.$defaultSettings = require('./lib/defaultSettings');
constructor.$errors = require('./lib/errors');
constructor.$forwarder = require('./lib/forwarder');
constructor.$gui = require('./lib/gui');
constructor.$httpInterface = require('./lib/httpInterface');
constructor.$keys = require('./lib/keys');
constructor.$playback = require('./lib/playback');
constructor.$recorder = require('./lib/recorder');
constructor.$reporter = require('./lib/reporter');
constructor.$responder = require('./lib/responder');
constructor.$scenario = require('./lib/scenario');
constructor.$scenarioRecorder = require('./lib/scenarioRecorder');
constructor.$server = require('./lib/server');
constructor.$stats = require('./lib/stats');
constructor.$utils = require('./lib/utils');

// TODO: perhaps we don't want to reference our modules through nocca.$module,
// TODO: as these could be overwritten by consumer before the run phase
function constructor (customOptions) {

    var opts = $extend(true, {}, constructor.$defaultSettings, customOptions);

    return new Nocca(opts);

}

// the instance can carry state and allows multiple instances to run at the same time
function Nocca (config) {

    // store what we need
    // TODO: set up members for all functions
    this.config = config;

    // TODO: these members should be set from config
    this.httpInterface = require('./lib/httpInterface');
    this.gui = require('./lib/gui');
    this.server = require('./lib/server');


    var cacheNames = Object.keys(config.endpoints);
    for (var i = 0; i < cacheNames.length; i++) {
        // TODO: should this come from config instead?
        constructor.$caches.newEndpoint(cacheNames[i], config.endpoints[cacheNames[i]]);
    }

    for (var j = 0; j < config.scenarios.available.length; j++) {
        // TODO: should this come from config instead?
        constructor.$playback.addScenario(config.scenarios.available[j].player());
    }


    // TODO: these functions may need to come from config
    this.httpInterface(config);
    this.gui(config);
    this.server(config, config.chainBuilderFactory(config));

}