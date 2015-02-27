'use strict';

var $extend = require('extend');

module.exports = constructor;

module.exports.$caches = require('./lib/caches');
module.exports.$chainBuilderFactory = require('./lib/chainBuilderFactory');
module.exports.$constants = require('./lib/constants');
module.exports.$defaultSettings = require('./lib/defaultSettings');
module.exports.$errors = require('./lib/errors');
module.exports.$forwarder = require('./lib/forwarder');
module.exports.$gui = require('./lib/gui');
module.exports.$httpInterface = require('./lib/httpInterface');
module.exports.$keys = require('./lib/keys');
module.exports.$playback = require('./lib/playback');
module.exports.$recorder = require('./lib/recorder');
module.exports.$reporter = require('./lib/reporter');
module.exports.$responder = require('./lib/responder');
module.exports.$scenario = require('./lib/scenario');
module.exports.$scenarioRecorder = require('./lib/scenarioRecorder');
module.exports.$server = require('./lib/server');
module.exports.$stats = require('./lib/stats');
module.exports.$utils = require('./lib/utils');

// TODO: perhaps we don't want to reference our exported modules
// TODO: as these could be overwritten by consumer before the run phase
function constructor (customOptions) {

    var config = $extend(true, {}, module.exports.$defaultSettings, customOptions);

    return new Nocca(config);

}

// the instance can carry state and allows multiple instances to run at the same time
function Nocca (config) {

    // map this to self so there are no this-scope issues
    var self = this;

    // store what we need
    // TODO: set up members for all functions?
    self.config = config;

    // set a logger to logger.disabled to turn off logging
    self.log = config.logger;
    self.logError = config.logger.error;
    self.logWarning = config.logger.warning;
    self.logSuccess = config.logger.success;
    self.logInfo = config.logger.info;
    self.logDebug = config.logger.debug;

    self.scenarioRecorder = config.playback.scenarioRecorder;

    // this instantiates the proxy, gui, httpApi and websocketServer
    // TODO: reference to $httpInterface should probably come from config
    self.server = new module.exports.$server(self, config.chainBuilderFactory(config));
    self.gui = new module.exports.$gui(self);
    self.httpInterface = new module.exports.$httpInterface(self);

    // TODO: these members should be set from config
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

}