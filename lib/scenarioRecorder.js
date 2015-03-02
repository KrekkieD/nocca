'use strict';

// TODO: should Nocca.$scenario not come from config?
var $fs = require('fs');

module.exports = ScenarioRecorder;

function ScenarioRecorder(Nocca) {
    
    var self = this;
    
    self.scenarioEntryRecorderFactory = scenarioEntryRecorderFactory;
    self.startRecordingScenario = startRecordingScenario;
    self.finishRecordingScenario = finishRecordingScenario;
    
    var recordingCounter = 1;
    var activeScenarioBuilder;
    
    function scenarioEntryRecorderFactory(fallBackRecorder) {
        return function (endpointKey, requestKey, mockEntry) {
            if (typeof activeScenarioBuilder === 'undefined') {
                if (typeof fallBackRecorder === 'undefined') {
                    console.log('|    Currently not recording a scenario, no fallback specified, ignoring mock entry');
                }
                else {
                    console.log('|    Currently not recording a scenario, forwarding entry to fallback recorder');
                    fallBackRecorder(endpointKey, requestKey, mockEntry);
                }
            }
            else {
                if (activeScenarioBuilder.isBuildingState()) { activeScenarioBuilder.then(); }

                console.log('|    Added recording to current scenario');
                activeScenarioBuilder.on(endpointKey)
                    .matchUsing(Nocca.scenario.Matchers.requestKeyMatcher(requestKey))
                    .respondWith(mockEntry);
            }

        };
    }

    function startRecordingScenario(options) {

        if (typeof activeScenarioBuilder === 'undefined') {
            if (typeof options === 'undefined' || !options || !options.hasOwnProperty('name')) { Nocca.throwError('A new scenario must have a name', Nocca.constants.ERRORS.INCOMPLETE_OBJECT); }

            console.log('|    Starting recording of new scenario');
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
            console.log('|    Finishing recording of new scenario');
            var scenario = activeScenarioBuilder.build();

            if (typeof scriptOutputDir !== 'undefined') {

                var filename = scriptOutputDir + '/scenario_' + scenario.name + '.js';
                $fs.writeFile(filename, Nocca.scenario.Serializer(scenario), function(err) {
                    if (err) { throw err; }
                    console.log('|      Saved serialized scenario to file: ' + filename);
                });

            }

            activeScenarioBuilder = undefined;
            return scenario;
        }

    }

}
