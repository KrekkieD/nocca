'use strict';

var _ = require('lodash');
// This repository explicitly depends on the internal scenarioRecorder (other repositories may depend on other recorders)
var $scenarioRecorder = require('./scenarioRecorder');
var $utils = require('./utils');

module.exports = ScenarioRepository;

function ScenarioRepository (Nocca) {
    var self = this;
    
    var scenarioRecorder = new $scenarioRecorder(Nocca, self);

    var scenarios = {};
    var scenarioEndpointBindings = {};

    self.matchRequest = scenarioBasedRequestMatcher;
    
    self.considerRecording = considerRecordingRequest;
    self.addScenario = addSingleScenario;
    self.exportScenarios = exportScenarios;
    self.resetScenario = resetScenario;
    self.name = function() { return 'memory-scenarios'; };
    this.type = function() { return Nocca.constants.RepositoryType.SCENARIOS; };

    self.init = function() { importInitialScenarios(); initRestRoutes(); };
    
// --  Import Data
    
    function importInitialScenarios() {

        // Loop over any provided scenarios, get their respective players registered with the playback service
        for (var i = 0, iMax = Nocca.config.scenarios.available.length; i < iMax; i++) {
            addSingleScenario(Nocca.config.scenarios.available[i].player());
        }

    }
    
// --  Scenario based playback (includes adding scenarios to the datastore)
    
    function considerRecordingRequest(reqContext) {
        
        // TODO: Add consideration logic :)
        return scenarioRecorder.considerRecording(reqContext);
        
    }

    function scenarioBasedRequestMatcher(reqContext) {
        var result = null;

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

            Nocca.logSuccess('Playing scenario request: ' + potentialScenarios[0].scenario.title + ' -- ' + potentialScenarios[0].currentPosition.state.title);

            result = Nocca.httpMessageFactory.createResponse(potentialScenarios[0].currentPosition.state.response.playbackResponse);

            deregisterScenarioFromEndpoint(potentialScenarios[0], potentialScenarios[0].currentPosition.state.endpointKey);
            potentialScenarios[0].next();
            if (!potentialScenarios[0].finished) {
                registerScenarioOnEndpoint(potentialScenarios[0], potentialScenarios[0].currentPosition.state.endpointKey);
            }

        }

        return result;
    }

    function addSingleScenario(scenarioPlayer) {
        Nocca.logInfo('Saving new scenario to player: ' + scenarioPlayer.scenario.title + ' (' + scenarioPlayer.scenario.name + ')');
        if (scenarioPlayer.hasOwnProperty('$$active')) { throw Error('The specified scenario is already coupled to a player!'); }

        scenarioPlayer.$$active = false;
        scenarios[scenarioPlayer.scenario.name] = scenarioPlayer;

        registerScenarioOnEndpoint(scenarioPlayer, scenarioPlayer.currentPosition.state.endpointKey);
    }
    
    function deregisterScenarioFromEndpoint(scenarioPlayer, endpoint) {
        delete scenarioEndpointBindings[endpoint][scenarioPlayer.scenario.name];
        scenarioPlayer.$$active = false;
    }

    function registerScenarioOnEndpoint(scenarioPlayer, endpoint) {
        if (!scenarioEndpointBindings.hasOwnProperty(endpoint)) {
            scenarioEndpointBindings[endpoint] = {};
        }
        scenarioEndpointBindings[endpoint][scenarioPlayer.scenario.name] = scenarioPlayer;
        scenarioPlayer.$$active = true;
    }
    

// --- Export data

    function exportScenarios (key) {

        return (typeof key !== 'undefined') ? scenarios[key] : scenarios;

    }

    function resetScenario(scenarioKey) {
        var scenarioPlayer = scenarios[scenarioKey];

        //Nocca.logInfo('Resetting scenario \'' + scenarioPlayer.scenario.title + '\'');
        deregisterScenarioFromEndpoint(scenarioPlayer, scenarioPlayer.currentPosition.state.endpointKey);
        scenarioPlayer.reset();
        registerScenarioOnEndpoint(scenarioPlayer, scenarioPlayer.currentPosition.state.endpointKey);

    }
    
// --- Control routes
    
    function initRestRoutes() {
        
        scenarioRecorder.init();

        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['DELETE:/scenarios/:scenarioKey/currentPosition', true, resetScenarioByKey]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['GET:/scenarios', getAllScenarios]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['GET:/scenarios/:scenarioKey', true, getScenarioByKey]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['GET:/scenarios/:scenarioKey/active', true, getScenarioStatusByKey]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['PUT:/scenarios/:scenarioKey/active', true, setScenarioStatusByKey]);

    }

    function resetScenarioByKey(apiReq) {
        try {
            resetScenario(apiReq.matches.scenarioKey);

            apiReq.ok().end(JSON.stringify(exportScenarios(apiReq.matches.scenarioKey).currentPosition));

        } catch (e) {
            apiReq.notFound().end();
        }
    }

    function getAllScenarios(apiReq) {
        apiReq.ok().end(JSON.stringify(exportScenarios()));
    }

    function getScenarioByKey (apiReq) {
        try {
            var requestedScenario = exportScenarios(apiReq.matches.scenarioKey);
            if (typeof requestedScenario === 'undefined') { throw new Error(); }
            apiReq.ok().end(JSON.stringify(requestedScenario));
        } catch (e) {
            apiReq.notFound().end();
        }
    }

    function getScenarioStatusByKey (apiReq) {
        try {
            // This statement may cause exceptions while attempting to deref the scenario status, which will result in 404
            var requestedScenarioStatus = exportScenarios(apiReq.matches.scenarioKey).$$active;
            apiReq.ok().end(JSON.stringify(requestedScenarioStatus));
        } catch (e) {
            apiReq.notFound().end();
        }
    }

    function setScenarioStatusByKey (apiReq) {
        try {
            // This statement may cause exceptions while attempting to deref the scenario status, which will result in 404
            var requestedScenario = exportScenarios(apiReq.matches.scenarioKey);
            if (typeof requestedScenario === 'undefined') { throw new Error(); }
            
            $utils.readBody(apiReq.req).then(function(body) {
                body = JSON.parse(body);
                
                if (_.isBoolean(body)) {
                    
                    if (body && !requestedScenario.$$active) {
                        registerScenarioOnEndpoint(requestedScenario, requestedScenario.currentPosition.state.endpointKey);
                    }
                    else if (!body && requestedScenario.$$active) {
                        deregisterScenarioFromEndpoint(requestedScenario, requestedScenario.currentPosition.state.endpointKey);
                    }
                    
                    apiReq.ok().end(JSON.stringify(requestedScenario.$$active));
                    
                }
                else {

                    apiReq.badRequest().end('Status must be boolean');

                }

            }).fail(function() {

                apiReq.badRequest().end('Unable to read response');

            });
            
        } catch (e) {
            apiReq.notFound().end();
        }
    }



}
