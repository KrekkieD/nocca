'use strict';

var $extend = require('extend');
var $pubsub = require('node-pubsub');

var $bunyanLogger = require('./lib/bunyanLogger');
var $chainBuilderFactory = require('./lib/chainBuilderFactory');
var $constants = require('./lib/constants');
var $defaultSettings = require('./lib/defaultSettings');
var $errorHandler = require('./lib/errorHandler');
var $forwarder = require('./lib/forwarder');
var $httpMessageFactory = require('./lib/httpMessageFactory');
var $playback = require('./lib/playback');
var $pluginLoader = require('./lib/pluginLoader');
var $recorder = require('./lib/recorder');
var $requestContextFactory = require('./lib/requestContextFactory');
var $requestExtractor = require('./lib/requestExtractor');
var $responder = require('./lib/responder');
var $stats = require('./lib/stats');
var $utils = require('./lib/utils');
var $wrapperServer = require('./lib/wrapperServer');


module.exports = Nocca;

// the instance can carry state and allows multiple instances to run at the same time
function Nocca (config) {

    // map this to self so there are no this-scope issues
    var self = this;

    self.initialized = false;

    self.config = $extend(true, {}, $defaultSettings, config);

    self.constants = $constants;

    self.pubsub = $pubsub;

    self.logger = new $bunyanLogger(self, self.config.logger);

    self.pluginLoader = new $pluginLoader(self);
    self.usePlugin = usePlugin;

    self.getConfig = $utils.extractConfig;


    // load all plugins from config so they can be used when parsing config
    self.pluginLoader.registerPlugins(self.config.plugins);

    self.playback = new $playback(self);
    self.errorHandler = new $errorHandler(self);
    self.requestContextFactory = new $requestContextFactory(self);
    self.httpMessageFactory = new $httpMessageFactory(self);
    self.requestChainer = new $chainBuilderFactory(self);
    self.requestExtractor = new $requestExtractor(self);
    self.forwarder = new $forwarder(self);
    self.recorder = new $recorder(self);
    self.responder = new $responder(self);
    self.statsLogger = new $stats(self);
    self.wrapperServer = new $wrapperServer(self);


    // initialize repositories up front
    self.config.repositories.forEach(function (repository) {
        self.usePlugin(repository);
    });


    self.logger.info('---');
    self.logger.info('>> Nocca v' + require(__dirname + '/package.json').version + ' initialized');
    self.logger.info('---');

    // inform all pubsub listeners that Nocca is initialized
    self.pubsub.publish(self.constants.PUBSUB_NOCCA_INITIALIZE_PLUGIN);

    // and mark ourselves as initialized
    self.initialized = true;

    function usePlugin (pluginId) {

        if (!Array.isArray(pluginId)) {
            pluginId = [pluginId];
        }

        self.logger.debug('Using plugin ' + pluginId[0]);

        return self.pluginLoader.instantiatePlugin.apply(null, pluginId);

    }

}
