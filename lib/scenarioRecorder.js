'use strict';

var $fs = require('fs');
var $utils = require('./utils');

module.exports = ScenarioRecorder;

function ScenarioRecorder(Nocca, Repository) {
    
    var self = this;
    
    self.init = initRestRoutes;
    
    self.considerRecording = considerRecordingRequest;
    self.startRecordingScenario = startRecordingScenario;
    self.finishRecordingScenario = finishRecordingScenario;
    self.isRecording = isRecording;
    
    var recordingCounter = 1;
    var activeScenarioBuilder;
    
    function considerRecordingRequest (reqContext) {
        var recordedResponse = false;
        
        if (typeof activeScenarioBuilder === 'undefined') {
            Nocca.logDebug('Currently not recording a scenario, not recording this request here');
        }
        else {
            if (activeScenarioBuilder.isBuildingState()) { activeScenarioBuilder.then(); }

            Nocca.logInfo('Added recording to current scenario');
            activeScenarioBuilder.on(reqContext.endpoint.key)
                .matchUsing(Nocca.scenario.Matchers.requestKeyMatcher(reqContext.requestKey))
                .respondWith({
                    requestKey: reqContext.requestKey,
                    // TODO: reconsider adding this
                    endpointKey: reqContext.endpoint.key,
                    playbackResponse: reqContext.getProxyResponse().dump()
                });
            recordedResponse = true;
        }

        return recordedResponse;
    }

    function isRecording () {

        return typeof activeScenarioBuilder !== 'undefined' ? activeScenarioBuilder : false;

    }

    function startRecordingScenario(options) {

        if (typeof activeScenarioBuilder === 'undefined') {
            if (typeof options === 'undefined' || !options || !options.hasOwnProperty('name')) { Nocca.throwError('A new scenario must have a name', Nocca.constants.ERRORS.INCOMPLETE_OBJECT); }

            Nocca.logInfo('Starting recording of new scenario');
            activeScenarioBuilder = new Nocca.scenario.Builder(options.name, options.title || ('Recorded Scenario ' + recordingCounter++));

            // This if is currently commented out, because there is only one type, so it is also the default
            //if (options.type === Nocca.$scenario.TYPE.SEQUENTIAL) {
            activeScenarioBuilder.sequentialScenario();
            //}
            if (options.repeatable === Nocca.constants.SCENARIO_REPEATABLE_ONE_SHOT) {
                activeScenarioBuilder.oneShot();
            }
            else {
                activeScenarioBuilder.infiniteLoop();
            }

            return activeScenarioBuilder;
        }
        else {
            Nocca.throwError('A recording is already active, please finish it before starting a new one', Nocca.constants.ERRORS.ALREADY_RECORDING);
        }

    }

    function finishRecordingScenario(scriptOutputDir) {

        if (typeof activeScenarioBuilder === 'undefined') {
            Nocca.throwError('No scenario is being recorded, cannot finish anything.', Nocca.constants.ERRORS.ALREADY_RECORDING);
        }
        else {
            Nocca.logInfo('Finishing recording of new scenario');
            var scenario = activeScenarioBuilder.build();

            if (typeof scriptOutputDir !== 'undefined') {

                var filename = scriptOutputDir + '/scenario_' + scenario.name + '.js';
                $fs.writeFile(filename, Nocca.scenario.Serializer(scenario), function(err) {
                    if (err) { throw err; }
                    Nocca.logInfo('Saved serialized scenario to file: ' + filename);
                });

            }

            activeScenarioBuilder = undefined;
            return scenario;
        }

    }
    
    function initRestRoutes() {

        var routes = [
            ['GET:/scenarios/recorder', getRecorder],
            ['PUT:/scenarios/recorder', changeRecorderState],
            ['DELETE:/scenarios/recorder', cancelRecordingScenario],
            ['OPTIONS:/scenarios/recorder', allowRecorderCall]
        ];

        routes.forEach(function (routeConfig) {
            Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, routeConfig);
        });

    }

    function allowRecorderCall (apiReq) {

        apiReq.ok({
            'Allow': 'GET,PUT'
        }).end();

    }

    function getRecorder (apiReq) {

        var recordingState = isRecording();
        if (recordingState !== false) {

            apiReq.ok({
                'Content-Type': 'application/json'
            }).end(recordingState);

        }
        else {

            apiReq.notFound().end();

        }

    }

    function changeRecorderState (apiReq) {

        $utils.readBody(apiReq.req)
            .then(function (body) {

                body = JSON.parse(body);

                if (body.startRecording === true) {
                    doStartRecordingScenario(apiReq, body);
                }
                else if (body.stopRecording === true) {
                    doStopRecordingScenario(apiReq, body);
                }
                else {
                    apiReq.badRequest('Bad body content').end();
                }

            });

    }

    function doStartRecordingScenario (apiReq, body) {
        try {
            var builder = startRecordingScenario(body);

            apiReq.ok({
                'Content-Type': 'application/json',
                'Location': '/scenarios/' + body.name
            }).end(builder.scenario);

        } catch (e) {
            switch (e.id) {
                case Nocca.constants.ERRORS.ALREADY_RECORDING:
                    apiReq.conflict('Already Recording');
                    break;
                case Nocca.constants.ERRORS.INCOMPLETE_OBJECT:
                    apiReq.badRequest('Supply a name and title for the new scenario');
                    break;
                default:
                    apiReq.internalError();
            }

            apiReq.end(e.message);

        }
    }

    function doStopRecordingScenario (apiReq) {
        try {
            var scriptOutputDir = undefined;
            if (Nocca.config.scenarios.writeNewScenarios && Nocca.config.scenarios.scenarioOutputDir) {
                scriptOutputDir = Nocca.config.scenarios.scenarioOutputDir;
            }

            var scenario = finishRecordingScenario(scriptOutputDir);

            apiReq.ok({
                'Content-Type': 'application/json'
            }).end(scenario);

        } catch (e) {

            Nocca.logError(e);
            apiReq.conflict('Finish Recording Failed').end(e.message);

        }
    }

    function cancelRecordingScenario (apiReq) {

        try {
            var scriptOutputDir = undefined;
            var scenario = finishRecordingScenario(scriptOutputDir);

            apiReq.ok({
                'Content-Type': 'application/json'
            }).end(scenario);

        } catch (e) {
            apiReq.conflict('Finish Recording Failed').end(e.message);
        }

    }



}
