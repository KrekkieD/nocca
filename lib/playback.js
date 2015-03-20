'use strict';

var _ = require('lodash');

module.exports = Playback;

function Playback (Nocca) {
    
    this.findMatchingRequest = findMatchingRequest;
    this.init = function() {

        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['GET:/repositories/', listRepositories]);

    };

    function findMatchingRequest(reqContext) {

        for (var i = 0; !reqContext.getPlaybackResponse() && i < Nocca.repositories.length; i++) {
            
            reqContext.setPlaybackResponse(Nocca.repositories[i].matchRequest(reqContext));
            
        }
        
        return reqContext;
    }

    function listRepositories(apiReq) {

        apiReq.ok().end(JSON.stringify(_.map(Nocca.repositories, function(repo) { return { name: repo.name(), type: repo.type() }; })));

    }
    
}
