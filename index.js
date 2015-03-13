'use strict';

var $extend = require('extend');
var $pubsub = require('node-pubsub');


module.exports = Nocca;

module.exports.$chainBuilderFactory = require('./lib/chainBuilderFactory');
module.exports.$constants = require('./lib/constants');
module.exports.$defaultSettings = require('./lib/defaultSettings');
module.exports.$endpoints = require('./lib/endpoints');
module.exports.$errors = require('./lib/errors');
module.exports.$forwarder = require('./lib/forwarder');
module.exports.$gui = require('./lib/gui');
module.exports.$keys = require('./lib/keys');
module.exports.$logger = require('./lib/logger');
module.exports.$playback = require('./lib/playback');
module.exports.$recorder = require('./lib/recorder');
module.exports.$requestExtractor = require('./lib/requestExtractor');
module.exports.$responder = require('./lib/responder');
module.exports.$scenario = require('./lib/scenario');
module.exports.$scenarioRecorder = require('./lib/scenarioRecorder');
module.exports.$server = require('./lib/server');
module.exports.$stats = require('./lib/stats');
module.exports.$utils = require('./lib/utils');
module.exports.$websocketServer = require('./lib/websocketServer');
module.exports.throwError = throwNoccaError;


// the instance can carry state and allows multiple instances to run at the same time
function Nocca (config) {

    // these requires are within the Nocca instance to make sure the modules are unchanged
    var $constants = require('./lib/constants');
    var $defaultSettings = require('./lib/defaultSettings');

    // map this to self so there are no this-scope issues
    var self = this;

    // store merged config
    self.config = $extend(true, {}, $defaultSettings, config);

    // add constants for ease of reference
    self.constants = $constants;

    // NOTE: pubsub is NOT configurable
    self.pubsub = $pubsub;

    self.throwError = throwNoccaError;


    //   C O N F I G U R A B L E   S T U F F   B E L O W

    // set a logger to logger.disabled to turn off logging
    self.log = self.config.logger;
    self.logError = self.config.logger.error;
    self.logWarning = self.config.logger.warning;
    self.logSuccess = self.config.logger.success;
    self.logInfo = self.config.logger.info;
    self.logDebug = self.config.logger.debug;


    self.requestContextFactory = new self.config.requestContextFactory(self);
    self.httpMessageFactory = new self.config.httpMessageFactory(self);
    self.requestChainer = new self.config.chainBuilderFactory(self);
    self.requestExtractor = new self.config.requestExtractor(self);
    self.forwarder = new self.config.forwarder(self);
    self.recorder = new self.config.recorder(self);
    self.responder = new self.config.responder(self);
    self.statsLogger = new self.config.statistics.instance(self);

    // This plugin should be transparently pluggable. It now enabled scenarios by default
    self.scenarioRecorder = new Nocca.$scenarioRecorder(self);
    self.scenario = Nocca.$scenario;
    self.config.playback.recorder = self.scenarioRecorder.scenarioEntryRecorderFactory(self.config.playback.recorder);

    // instantiate servers by looping over them. Nice.
    Object.keys(self.config.servers).forEach(function (server) {

        if (self.config.servers[server].enabled === true) {
            self[server] = new self.config.servers[server].instance(self);
        }

    });

    self.endpointManager = new self.config.endpointManager(self);
    self.endpointManager.addEndpoints(self.config.endpoints);

    // Loop over any provided scenarios, get their respective players registered with the playback service
    for (var i = 0, iMax = self.config.scenarios.available.length; i < iMax; i++) {
        self.config.playback.scenarioRecorder(self.config.scenarios.available[i].player());
    }

    // run all stat reporters so they can subscribe to events. Send in the instance as arg.
    self.config.statistics.reporters.forEach(function (reporter) {
        reporter(self);
    });

}

function throwNoccaError(message, errorCode) {
    var e = new Error(message);
    e.name = errorCode;
    throw e;
}