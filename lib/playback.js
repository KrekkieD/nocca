'use strict';

module.exports = Playback;

function Playback (Nocca) {

    var self = this;

    self.logger = Nocca.logger.child({ module: 'Playback' });

    return findMatchingRequest;

    function findMatchingRequest (reqContext) {

        var repositories = reqContext.config.repositories || [];

        var repositoryPlugin;
        var playbackResponse;

        for (var i = 0, iMax = repositories.length; i < iMax; i++) {

            repositoryPlugin = repositories[i];

            playbackResponse = Nocca.usePlugin(repositoryPlugin).matchRequest(reqContext);

            if (playbackResponse) {
                reqContext.setPlaybackResponse(playbackResponse);
                self.logger.info('Cache found in repository: ' + Nocca.pluginLoader.getPluginDefinition(repositoryPlugin).name);

                break;
            }

        }

        return reqContext;

    }

}
