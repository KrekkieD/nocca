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

                break;
            }

        }

        return reqContext;

    }

}
