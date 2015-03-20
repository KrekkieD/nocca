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
    
    function considerRecordingRequest(reqContext) {
        
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
        }

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

        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['GET:/scenarios/recorder', getRecorder]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['PUT:/scenarios/recorder', changeRecorderState]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['DELETE:/scenarios/recorder', cancelRecordingScenario]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['OPTIONS:/scenarios/recorder', allowRecorderCall]);


    }

    function allowRecorderCall (req, res, config, match, writeHead, writeEnd) {

        writeHead(res, 200, {
            'Allow': 'GET,PUT'
        }).writeEnd();

    }

    function getRecorder (req, res, config, match, writeHead, writeEnd) {

        var recordingState = isRecording();
        if (recordingState !== false) {

            writeHead(res, 200, {
                'Content-Type': 'application/json'
            }).writeEnd(JSON.stringify(recordingState));

        }
        else {

            writeHead(res, 404).writeEnd();

        }

    }

    function changeRecorderState (req, res, config, match, writeHead, writeEnd) {

        $utils.readBody(req)
            .then(function (body) {

                body = JSON.parse(body);

                if (body.startRecording === true) {
                    doStartRecordingScenario(req, res, body, writeHead, writeEnd);
                }
                else if (body.stopRecording === true) {
                    doStopRecordingScenario(req, res, body, writeHead, writeEnd);
                }
                else {
                    writeHead(res, 400).writeEnd('Bad body content');
                }

            });

    }

    function doStartRecordingScenario (req, res, body, writeHead, writeEnd) {
        try {
            var builder = startRecordingScenario(body);

            writeHead(res, 200, {
                'Content-Type': 'application/json',
                'Location': '/scenarios/' + body.name
            }).writeEnd(JSON.stringify(builder.scenario));

        } catch (e) {
            switch (e.id) {
                case Nocca.constants.ERRORS.ALREADY_RECORDING:
                    writeHead(res, 409, 'Already Recording');
                    break;
                case Nocca.constants.ERRORS.INCOMPLETE_OBJECT:
                    writeHead(res, 400, 'Supply a name and title for the new scenario');
                    break;
                default:
                    writeHead(res, 500);
            }

            writeEnd(res, e.message);

        }
    }

    function doStopRecordingScenario (req, res, body, writeHead, writeEnd) {
        try {
            var scriptOutputDir = undefined;
            if (Nocca.config.scenarios.writeNewScenarios && Nocca.config.scenarios.scenarioOutputDir) {
                scriptOutputDir = Nocca.config.scenarios.scenarioOutputDir;
            }

            var scenario = finishRecordingScenario(scriptOutputDir);

            writeHead(res, 200, {
                'Content-Type': 'application/json'
            }).writeEnd(JSON.stringify(scenario));

        } catch (e) {

            Nocca.logError(e);
            writeHead(res, 409, 'Finish Recording Failed').writeEnd(e.message);

        }
    }

    function cancelRecordingScenario (req, res, config, match, writeHead, writeEnd) {

        try {
            var scriptOutputDir = undefined;
            var scenario = finishRecordingScenario(scriptOutputDir);

            writeHead(res, 200, {
                'Content-Type': 'application/json'
            }).writeEnd(JSON.stringify(scenario));

        } catch (e) {
            writeHead(res, 409, 'Finish Recording Failed').writeEnd(e.message);
        }

    }



}
