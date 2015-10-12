'use strict';

var $extend = require('extend');
var $pubsub = require('node-pubsub');

var $bunyanLogger = require('./lib/bunyanLogger');
var $utils = require('./lib/utils');
var $constants = require('./lib/constants');
var $defaultSettings = require('./lib/defaultSettings');
var $pluginLoader = require('./lib/pluginLoader');
var $playback = require('./lib/playback');
var $wrapperServer = require('./lib/wrapperServer');

var $forwarder = require('./lib/forwarder');
var $recorder = require('./lib/recorder');
var $responder = require('./lib/responder');
var $errors = require('./lib/errors');
var $requestContextFactory = require('./lib/requestContextFactory');
var $httpMessageFactory = require('./lib/httpMessageFactory');
var $chainBuilderFactory = require('./lib/chainBuilderFactory');
var $requestExtractor = require('./lib/requestExtractor');
var $stats = require('./lib/stats');


module.exports = Nocca;

// the instance can carry state and allows multiple instances to run at the same time
function Nocca (config) {

    // map this to self so there are no this-scope issues
    var self = this;

    self.initialized = false;

    // store merged config
    self.config = $extend(true, {}, $defaultSettings, config);

    // add constants for ease of reference
    self.constants = $constants;

    // NOTE: pubsub is NOT configurable
    self.pubsub = $pubsub;

    self.logger = new $bunyanLogger(self, self.config.logger);


    self.pluginLoader = new $pluginLoader(self);
    self.usePlugin = usePlugin;

    self.throwError = throwNoccaError;

    self.getConfig = $utils.extractConfig;


    // load all plugins from config so they can be used when parsing config
    if (self.config.plugins && Array.isArray(self.config.plugins)) {
        self.pluginLoader.registerPlugins(self.config.plugins);
    }


    self.playback = new $playback(self);


    //   C O N F I G U R A B L E   S T U F F   B E L O W


    self.errorHandler = new $errors(self);
    self.requestContextFactory = new $requestContextFactory(self);
    self.httpMessageFactory = new $httpMessageFactory(self);
    self.requestChainer = new $chainBuilderFactory(self);
    self.requestExtractor = new $requestExtractor(self);
    self.forwarder = new $forwarder(self);
    self.recorder = new $recorder(self);
    self.responder = new $responder(self);
    self.statsLogger = new $stats(self);

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
