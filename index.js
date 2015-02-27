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

    // map this to self so there are no this-scope issues
    var self = this;

    // store what we need
    // TODO: set up members for all functions
    self.config = config;

    self.scenarioRecorder = config.playback.scenarioRecorder;

    // TODO: these members should be set from config
    self.httpInterface = require('./lib/httpInterface');
    self.gui = require('./lib/gui');
    self.server = require('./lib/server');
    self.caches = require('./lib/caches');


    // TODO: set up members for all non-functions
    self.endpoints = config.endpoints;

    Object.keys(config.endpoints).forEach(function (key) {
        // TODO: should this come from config instead?
        self.caches.newEndpoint(key, self.endpoints[key]);
    });

    // TODO: add comment to explain what this does
    for (var i = 0, iMax = config.scenarios.available.length; i < iMax; i++) {
        self.scenarioRecorder(config.scenarios.available[i].player());
    }


    // TODO: these functions may need to come from config
    self.httpInterface(config);
    self.gui(config);
    self.server(config, config.chainBuilderFactory(config));

}