'use strict';

// This repository explicitly depends on the internal scenarioRecorder (other repositories may depend on other recorders)
var $scenarioRecorder = require('./scenarioRecorder');

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
        scenarioRecorder.considerRecording(reqContext);
        
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

    }

    function resetScenarioByKey(req, res, config, params, writeHead, writeEnd) {
        try {
            resetScenario(params.scenarioKey);

            writeHead(res)
                .writeEnd(JSON.stringify(exportScenarios(params.scenarioKey).currentPosition));

        } catch (e) {
            writeHead(res, 404).writeEnd();
        }
    }

    function getAllScenarios(req, res, config, match, writeHead, writeEnd) {
        writeHead(res).writeEnd(JSON.stringify(exportScenarios()));
    }

    function getScenarioByKey (req, res, config, params, writeHead, writeEnd) {
        try {

            writeHead(res)
                .writeEnd(JSON.stringify(exportScenarios(params.scenarioKey)));

        } catch (e) {
            writeHead(res, 404).writeEnd();
        }
    }

    function getScenarioStatusByKey (req, res, config, params, writeHead, writeEnd) {
        // TODO: noooo, you're dependant on the $$active property now! Blegh
        try {
            writeHead(res)
                .writeEnd(JSON.stringify(exportScenarios(params.scenarioKey).$$active));

        } catch (e) {
            writeHead(res, 404).writeEnd();
        }
    }



}
