'use strict';

var $fs = require('fs');
var $path = require('path');

var $scenario = require('./scenario');
var $utils = require('./../../utils');

var $mkdirp = require('mkdirp');

module.exports = ScenarioRecorder;

function ScenarioRecorder(Nocca) {

    var self = this;

    self.logger = Nocca.logger.child({ module: 'ScenarioRecorder' });

    self.init = initRestRoutes;

    self.considerRecording = considerRecordingRequest;
    self.startRecordingScenario = startRecordingScenario;
    self.finishRecordingScenario = finishRecordingScenario;
    self.isRecording = isRecording;

    // instantiate private instance
    self.scenario = new $scenario(Nocca);

    var recordingCounter = 1;
    var activeScenarioBuilder;

    function considerRecordingRequest (reqContext) {

        var recordedResponse = false;

        if (typeof activeScenarioBuilder === 'undefined') {
            self.logger.debug('Currently not recording a scenario, not recording this request here');
        }
        else {

            if (activeScenarioBuilder.isBuildingState()) {
                activeScenarioBuilder.then();
            }

            self.logger.info('Added recording to current scenario');

            var recordingObj = {};
            recordingObj.requestKey = reqContext.requestKey;
            recordingObj.endpointKey = reqContext.endpoint.key;
            recordingObj.proxyRequest = reqContext.getProxyRequest().dump();
            // the recordingSubject is the httpMessageType used for the recording (proxy or playback response)
            recordingObj.playbackResponse = reqContext.getHttpMessage(reqContext.config.recordingSubject).dump();
            recordingObj.clientRequest = reqContext.getClientRequest().dump();


            activeScenarioBuilder.on(reqContext.endpoint.key)
                .matchUsing(self.scenario.Matchers.requestKeyMatcher(reqContext.requestKey))
                .respondWith(recordingObj);

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

            self.logger.info('Starting recording of new scenario');
            activeScenarioBuilder = new self.scenario.Builder(options.name, options.title || ('Recorded Scenario ' + recordingCounter++));

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
            self.logger.info('Finishing recording of new scenario');
            var scenario = activeScenarioBuilder.build();

            if (typeof scriptOutputDir !== 'undefined') {

                var dirname = $path.resolve('.', scriptOutputDir);

                // create dir to make sure it exists
                $mkdirp.sync(dirname);

                var filename = dirname + '/scenario_' + scenario.name + '.js';
                $fs.writeFile(filename, self.scenario.serializer(scenario), function(err) {
                    if (err) { throw err; }
                    self.logger.info('Saved serialized scenario to file: ' + filename);
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

            self.logger.error(e);
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
