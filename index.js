'use strict';

var _ = require('lodash');

var $extend = require('extend');
var $pubsub = require('node-pubsub');
var $bunyan = require('bunyan');

module.exports = Nocca;

module.exports.$cacheEntryRepository = require('./lib/cacheEntryRepository');
module.exports.$chainBuilderFactory = require('./lib/chainBuilderFactory');
module.exports.$constants = require('./lib/constants');
module.exports.$defaultSettings = require('./lib/defaultSettings');
module.exports.$errors = require('./lib/errors');
module.exports.$forwarder = require('./lib/forwarder');
module.exports.$logger = require('./lib/logger');
module.exports.$patchScenarios = require('./lib/patchScenarios');
module.exports.$recorder = require('./lib/recorder');
module.exports.$requestExtractor = require('./lib/requestExtractor');
module.exports.$responder = require('./lib/responder');
module.exports.$stats = require('./lib/stats');
module.exports.$utils = require('./lib/utils');
module.exports.throwError = throwNoccaError;


// the instance can carry state and allows multiple instances to run at the same time
function Nocca (config) {

    // these requires are within the Nocca instance to make sure the modules are unchanged
    var $constants = require('./lib/constants');
    var $defaultSettings = require('./lib/defaultSettings');

    var $pluginLoader = require('./lib/pluginLoader');
    var $utils = require('./lib/utils');
    var $playback = require('./lib/playback');
    var $wrapperServer = require('./lib/wrapperServer');


    // map this to self so there are no this-scope issues
    var self = this;

    self.initialized = false;

    // store merged config
    self.config = $extend(true, {}, $defaultSettings, config);

    // add constants for ease of reference
    self.constants = $constants;

    // NOTE: pubsub is NOT configurable
    self.pubsub = $pubsub;

    self.pluginLoader = new $pluginLoader(self);
    self.usePlugin = usePlugin;

    self.throwError = throwNoccaError;
    self.getConfig = $utils.extractConfig;

    self.playback = new $playback(self);

    // load all plugins from config so they can be used when parsing config
    if (self.config.plugins && Array.isArray(self.config.plugins)) {
        self.pluginLoader.registerPlugins(self.config.plugins);
    }

    //   C O N F I G U R A B L E   S T U F F   B E L O W

    // set a logger to logger.disabled to turn off logging
    self.log = self.config.logger;
    self.logError = self.config.logger.error;
    self.logWarning = self.config.logger.warning;
    self.logSuccess = self.config.logger.success;
    self.logInfo = self.config.logger.info;
    self.logDebug = self.config.logger.debug;


    self.errorHandler = new self.config.errorHandler(self);
    self.requestContextFactory = new self.config.requestContextFactory(self);
    self.httpMessageFactory = new self.config.httpMessageFactory(self);
    self.requestChainer = new self.config.chainBuilderFactory(self);
    self.requestExtractor = new self.config.requestExtractor(self);
    self.forwarder = new self.config.forwarder(self);
    self.recorder = new self.config.recorder(self);
    self.responder = new self.config.responder(self);
    self.statsLogger = new self.config.statistics.instance(self);

    // initialize repositories up front
    self.config.repositories.forEach(function (repository) {
        self.usePlugin(repository);
    });

	// initialize the endpoint selector
	self.endpointSelector = self.usePlugin(self.config.endpointSelector);

    self.wrapperServer = new $wrapperServer(self);

    // Call init on all created plugins (if they support it)
	self.pubsub.publish(self.constants.PUBSUB_NOCCA_INITIALIZE_PLUGIN);

    // and mark ourselves as initialized
    self.initialized = true;
    
    // run all stat reporters so they can subscribe to events. Send in the instance as arg.
    self.config.statistics.reporters.forEach(function (reporter) {
        reporter(self);
    });

    function usePlugin (pluginId) {

        if (!Array.isArray(pluginId)) {
            pluginId = [pluginId];
        }
        return self.pluginLoader.instantiatePlugin.apply(null, pluginId);

    }

}

function throwNoccaError(message, errorCode) {
    var e = new Error(message);
    e.name = errorCode;
    throw e;
}
