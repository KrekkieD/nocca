'use strict';

module.exports = {};
module.exports.defaultRequestMatcher          = simpleRequestKeyRequestMatcher;
module.exports.simpleRequestKeyRequestMatcher = simpleRequestKeyRequestMatcher;
module.exports.scenarioBasedRequestMatcher    = scenarioBasedRequestMatcher;
module.exports.addRecording                   = addSingleRecording;
module.exports.addScenario                    = addSingleScenario;
module.exports.exportRecordings               = exportRecordings;

var $q = require('q');

var recordings = {};
var scenarios = {};
var scenarioEndpointBindings = {};

function addSingleRecording (endpoint, requestKey, recordedResponse) {

    // ensure presence of endpoint
    recordings[endpoint] = recordings[endpoint] || {};
    
    recordings[endpoint][requestKey] = recordedResponse;
    
}

function simpleRequestKeyRequestMatcher (reqContext) {
    var deferred = $q.defer();

    if (typeof recordings[reqContext.endpoint.key] !== 'undefined' &&
        typeof recordings[reqContext.endpoint.key][reqContext.requestKey] !== 'undefined') {

        reqContext.playbackResponse = recordings[reqContext.endpoint.key][reqContext.requestKey];
        console.log('|    Found a matching record!');

    }
    else {
        // Probably no recording found, just return the context as is
        console.log('|    No matching record found');
    }

    deferred.resolve(reqContext);

    return deferred.promise;

}

function scenarioBasedRequestMatcher(reqContext) {
    var deferred = $q.defer();
    
    var potentialScenarios = [];
    if (scenarioEndpointBindings.hasOwnProperty(reqContext.endpoint.key)) {
        Object.keys(scenarioEndpointBindings[reqContext.endpoint.key]).forEach(function (potentialScenarioKey) {
            var potentialScenario = scenarioEndpointBindings[reqContext.endpoint.key][potentialScenarioKey];

            if (potentialScenario.currentPosition.state.matcher(reqContext)) {
                potentialScenarios.push(potentialScenario);
            }

        });
    }
    
    if (potentialScenarios.length > 0) {
        // Take the first matching scenario and use its response
        reqContext.playbackResponse = potentialScenarios[0].currentPosition.state.response;
        console.log('|    Playing scenario request: ' + potentialScenarios[0].scenario.title + ' -- ' + potentialScenarios[0].currentPosition.title);
        deregisterScenarioFromEndpoint(potentialScenarios[0], potentialScenarios[0].currentPosition.state.endpointKey);
        potentialScenarios[0].next();
        if (!potentialScenarios[0].finished) {
            registerScenarioOnEndpoint(potentialScenarios[0], potentialScenarios[0].currentPosition.state.endpointKey);
        }
        
    }
    
    deferred.resolve(reqContext);
    
    return deferred.promise;
}

function addSingleScenario(scenarioPlayer) {

    if (scenarioPlayer.hasOwnProperty('$$scenarioKey')) { throw Error('The specified scenario is already coupled to a player!'); }
    
    scenarioPlayer.$$scenarioKey = 'scn-' + Object.keys(scenarios).length;
    scenarios[scenarioPlayer.$$scenarioKey] = scenarioPlayer;
    
    registerScenarioOnEndpoint(scenarioPlayer, scenarioPlayer.currentPosition.state.endpointKey);

}

function deregisterScenarioFromEndpoint(scenarioPlayer, endpoint) {
    delete scenarioEndpointBindings[endpoint][scenarioPlayer.$$scenarioKey];
}

function registerScenarioOnEndpoint(scenarioPlayer, endpoint) {
    if (!scenarioEndpointBindings.hasOwnProperty(endpoint)) {
        scenarioEndpointBindings[endpoint] = {};
    }
    scenarioEndpointBindings[endpoint][scenarioPlayer.$$scenarioKey] = scenarioPlayer;
}

function exportRecordings () {

    return recordings;

}