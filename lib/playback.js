'use strict';
// TODO: should be instance! cannot use Nocca reference
var $q = require('q');

module.exports = Playback;

function Playback (Nocca) {
    
    this.findMatchingRequest = findMatchingRequest;

    function findMatchingRequest(reqContext) {

        for (var i = 0; !reqContext.getPlaybackResponse() && i < Nocca.repositories.length; i++) {
            
            reqContext.setPlaybackResponse(Nocca.repositories[i].matchRequest(reqContext));
            
        }
        
        return reqContext;
    }
    
}
