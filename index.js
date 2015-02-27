'use strict';

var $extend = require('extend');
var $pubsub = require('node-pubsub');


module.exports = Nocca;

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
module.exports.$responder = require('./lib/responder');
module.exports.$scenario = require('./lib/scenario');
module.exports.$scenarioRecorder = require('./lib/scenarioRecorder');
module.exports.$server = require('./lib/server');
module.exports.$stats = require('./lib/stats');
module.exports.$utils = require('./lib/utils');


// the instance can carry state and allows multiple instances to run at the same time
function Nocca (config) {

    // these requires are within the instance to make sure there's no conflict with other instances
    var $caches = require('./lib/caches');
    var $constants = require('./lib/constants');
    var $defaultSettings = require('./lib/defaultSettings');
    var $gui = require('./lib/gui');
    var $httpInterface = require('./lib/httpInterface');
    var $server = require('./lib/server');


    // map this to self so there are no this-scope issues
    var self = this;

    // store what we need
    self.config = $extend(true, {}, $defaultSettings, config);

    self.constants = $constants;

    // set a logger to logger.disabled to turn off logging
    self.log = self.config.logger;
    self.logError = self.config.logger.error;
    self.logWarning = self.config.logger.warning;
    self.logSuccess = self.config.logger.success;
    self.logInfo = self.config.logger.info;
    self.logDebug = self.config.logger.debug;

    // TODO: set up members for all functions from config?
    self.scenarioRecorder = self.config.playback.scenarioRecorder;

    // this instantiates the proxy, gui, httpApi and websocketServer
    // TODO: all these references should probably come from config

    // NOTE: pubsub is NOT configurable
    self.pubsub = $pubsub;

    self.requestChainer = new self.config.chainBuilderFactory(self);
    self.statsLogger = new self.config.statistics.logger(self);
    self.server = new $server(self);
    self.gui = new $gui(self);
    self.httpInterface = new $httpInterface(self);

    self.cacheManager = new self.config.cacheManager(self);


    // TODO: set up members for all non-functions
    self.endpoints = self.config.endpoints;
    self.cacheManager.addCacheEndpoints(self.endpoints);

    // TODO: add comment to explain what this does
    for (var i = 0, iMax = self.config.scenarios.available.length; i < iMax; i++) {
        self.scenarioRecorder(self.config.scenarios.available[i].player());
    }

    // run all stat reporters so they can subscribe to events. Send in the instance as arg.
    self.config.statistics.reporters.forEach(function (reporter) {
        reporter(self);
    });

}