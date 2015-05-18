'use strict';

var _ = require('lodash');
var $utils = require('./utils');

module.exports = Playback;

function Playback (Nocca) {

    return findMatchingRequest;

    function findMatchingRequest (reqContext) {

        var repositories = reqContext.config.repositories || [];

        var repositoryPlugin;
        var repository;
        var playbackResponse;
        for (var i = 0, iMax = repositories.length; i < iMax; i++) {

            repositoryPlugin = repositories[i];

            playbackResponse = Nocca.usePlugin(repositoryPlugin).matchRequest(reqContext);

            if (playbackResponse) {
                reqContext.setPlaybackResponse(playbackResponse);
                Nocca.logDebug('Cache found in repository: ' + Nocca.pluginLoader.getPluginDefinition(repositoryPlugin).name);

                break;
            }

        }
        
        return reqContext;

    }

}
