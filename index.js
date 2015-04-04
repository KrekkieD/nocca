'use strict';

var _ = require('lodash');

var $extend = require('extend');
var $pubsub = require('node-pubsub');
var $q = require('q');


module.exports = Nocca;

module.exports.$cacheEntryRepository = require('./lib/cacheEntryRepository');
module.exports.$chainBuilderFactory = require('./lib/chainBuilderFactory');
module.exports.$constants = require('./lib/constants');
module.exports.$defaultSettings = require('./lib/defaultSettings');
module.exports.$endpoints = require('./lib/endpoints');
module.exports.$errors = require('./lib/errors');
module.exports.$forwarder = require('./lib/forwarder');
module.exports.$gui = require('./lib/gui');
module.exports.$keys = require('./lib/keys');
module.exports.$logger = require('./lib/logger');
module.exports.$patchScenarios = require('./lib/patchScenarios');
module.exports.$playback = require('./lib/playback');
module.exports.$recorder = require('./lib/recorder');
module.exports.$requestExtractor = require('./lib/requestExtractor');
module.exports.$responder = require('./lib/responder');
module.exports.$scenario = require('./lib/scenario');
module.exports.$scenarioRecorder = require('./lib/scenarioRecorder');
module.exports.$scenarioRepository = require('./lib/scenarioRepository');
module.exports.$proxy = require('./lib/proxy');
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
    self.getConfig = getConfig;


    //   C O N F I G U R A B L E   S T U F F   B E L O W
    var collectedPlugins = [];

    // set a logger to logger.disabled to turn off logging
    self.log = self.config.logger;
    self.logError = self.config.logger.error;
    self.logWarning = self.config.logger.warning;
    self.logSuccess = self.config.logger.success;
    self.logInfo = self.config.logger.info;
    self.logDebug = self.config.logger.debug;


    self.errorHandler = instantiateAndCollectPlugin(self.config.errorHandler, collectedPlugins);
    self.requestContextFactory = instantiateAndCollectPlugin(self.config.requestContextFactory, collectedPlugins);
    self.httpMessageFactory = instantiateAndCollectPlugin(self.config.httpMessageFactory, collectedPlugins);
    self.requestChainer = instantiateAndCollectPlugin(self.config.chainBuilderFactory, collectedPlugins);
    self.requestExtractor = instantiateAndCollectPlugin(self.config.requestExtractor, collectedPlugins);
    self.forwarder = instantiateAndCollectPlugin(self.config.forwarder, collectedPlugins);
    self.recorder = instantiateAndCollectPlugin(self.config.recorder, collectedPlugins);
    self.responder = instantiateAndCollectPlugin(self.config.responder, collectedPlugins);
    self.statsLogger = instantiateAndCollectPlugin(self.config.statistics.instance, collectedPlugins);
    self.playback = instantiateAndCollectPlugin(self.config.playback, collectedPlugins);
    self.scenario = instantiateAndCollectPlugin(self.config.scenario, collectedPlugins);

    self.repositories = _.map(self.config.repositories, function(RepositoryConstructor) {
        return instantiateAndCollectPlugin(RepositoryConstructor, collectedPlugins);
    });

    // instantiate servers by looping over them. Nice.
    Object.keys(self.config.servers).forEach(function (server) {

        if (self.config.servers[server].enabled === true) {
            self[server] = new self.config.servers[server].instance(self);
        }

    });

    self.endpointManager = instantiateAndCollectPlugin(self.config.endpointManager, collectedPlugins);
    self.endpointManager.addEndpoints(self.config.endpoints);

    // Call init on all created plugins (if they support it)
	// TODO: this can be improved by using pubsub to publish the event
    _.invoke(collectedPlugins, 'init');

	self.pubsub.publish(self.constants.PUBSUB_NOCCA_INITIALIZE_PLUGIN);
    
    // run all stat reporters so they can subscribe to events. Send in the instance as arg.
    self.config.statistics.reporters.forEach(function (reporter) {
        reporter(self);
    });

    
    function instantiateAndCollectPlugin(constructor, bucket) {
    
        var instance = new constructor(self);
        bucket.push(instance);
        return instance;
    
    }

}

function throwNoccaError(message, errorCode) {
    var e = new Error(message);
    e.name = errorCode;
    throw e;
}

function getConfig (key, obj, asPromise) {

	var workingObj = obj;

	var extractedConfig;

	var keys = key.split('.');

	while (keys.length) {
		key = keys.shift();
		workingObj = workingObj[key];
		extractedConfig = workingObj;

		if (typeof extractedConfig === 'undefined') {
			break;
		}
	}

	if (asPromise) {
		var deferred = $q.defer();

		typeof extractedConfig !== 'undefined' ?
			deferred.resolve(extractedConfig) : deferred.reject();

		return deferred.promise;
	}
	else {
		return extractedConfig;
	}

}

