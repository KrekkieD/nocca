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
module.exports.$responder = require('./lib/responder');
module.exports.$scenario = require('./lib/scenario');
module.exports.$scenarioRecorder = require('./lib/scenarioRecorder');
module.exports.$server = require('./lib/server');
module.exports.$stats = require('./lib/stats');
module.exports.$utils = require('./lib/utils');


function constructor (customOptions) {

    // this require is within the instance to make sure there's no conflict with other instances
    var $defaultSettings = require('./lib/defaultSettings');

    var config = $extend(true, {}, $defaultSettings, customOptions);

    return new Nocca(config);

}

// the instance can carry state and allows multiple instances to run at the same time
function Nocca (config) {

    // these requires are within the instance to make sure there's no conflict with other instances
    var $server = require('./lib/server');
    var $gui = require('./lib/gui');
    var $httpInterface = require('./lib/httpInterface');
    var $caches = require('./lib/caches');

    var $pubsub = require('node-pubsub');



    // map this to self so there are no this-scope issues
    var self = this;

    // store what we need
    self.config = config;

    // set a logger to logger.disabled to turn off logging
    self.log = config.logger;
    self.logError = config.logger.error;
    self.logWarning = config.logger.warning;
    self.logSuccess = config.logger.success;
    self.logInfo = config.logger.info;
    self.logDebug = config.logger.debug;

    // TODO: set up members for all functions from config?
    self.scenarioRecorder = config.playback.scenarioRecorder;

    // this instantiates the proxy, gui, httpApi and websocketServer
    // TODO: all these references should probably come from config

    // NOTE: pubsub is NOT configurable
    self.pubsub = $pubsub;

    self.requestChainer = new config.chainBuilderFactory(self);

    self.statsLogger = new config.statistics.logger(self);



    self.server = new $server(self);
    self.gui = new $gui(self);
    self.httpInterface = new $httpInterface(self);

    // TODO: instantiate for private instance!
    self.caches = $caches;


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

    // run all stat reporters so they can subscribe to events. Send in the instance as arg.
    config.statistics.reporters.forEach(function (reporter) {
        reporter(self);
    });

}