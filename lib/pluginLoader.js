'use strict';

module.exports = PluginLoader;

function PluginLoader (Nocca) {

    var self = this;

    var loadedPlugins = {};
    var instantiatedPlugins = {};

    self.registerPlugins = registerPlugins;
    self.getPluginDefinition = getPluginDefinition;
    self.instantiatePlugin = instantiatePlugin;

    function registerPlugins (plugins) {

        plugins.forEach(function (plugin) {

            if (typeof plugin === 'string') {
                // name for plugin!

                // load from the plugins dir, should return an object
                plugin = require(__dirname + '/plugins/' + plugin);

            }


            // if plugin was an object, or was require()'d as object, proceed
            if (typeof plugin === 'object') {
                // plugin definition!

                registerPlugin(plugin);

            }

        });

    }

    function registerPlugin (pluginDefinition) {

        // make sure it's valid before continuing
        validatePluginDefinition(pluginDefinition);

        // confirm plugin is not yet loaded
        if (typeof loadedPlugins[pluginDefinition.id] === 'undefined') {

            // register plugin
            loadedPlugins[pluginDefinition.id] = pluginDefinition;

			// some plugins are instantiated on load
			if (pluginDefinition.interface === 'httpApi') {
				Nocca.usePlugin(pluginDefinition.id);
			}

        }
		else if (loadedPlugins[pluginDefinition.id].constructor !== pluginDefinition.constructor) {
			throw 'Cannot load two different plugins with identical id\'s';
		}

    }

    function getPluginDefinition (pluginId) {

        return loadedPlugins[pluginId];

    }

    function instantiatePlugin (pluginId, pluginConfig) {

        // bitch about it if the plugin is unknown (i.e. not defined in plugins config)
        if (typeof loadedPlugins[pluginId] === 'undefined') {
            throw 'Cannot use plugin with id ' + pluginId + ' as it is not loaded';
        }

        // TODO: at this time it is always a single instance that is shared. Is this desirable?
        if (typeof instantiatedPlugins[pluginId] === 'undefined') {
            instantiatedPlugins[pluginId] = new loadedPlugins[pluginId].constructor(Nocca);
        }

        return instantiatedPlugins[pluginId].invoke(pluginConfig);

    }

    function validatePluginDefinition (pluginDefinition) {

        var requiredProperties = ['interface', 'id', 'constructor'];

        requiredProperties.forEach(function (property) {

            if (typeof pluginDefinition[property] === 'undefined') {
                throw 'Property ' + property + ' is not found in plugin definition: ' + JSON.stringify(pluginDefinition);
            }

        });

    }

}
