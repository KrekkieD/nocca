'use strict';

module.exports = {};
module.exports.scenarioEntryRecorderFactory = scenarioEntryRecorderFactory;
module.exports.startRecordingScenario = startRecordingScenario;
module.exports.finishRecordingScenario = finishRecordingScenario;

var $scenario = require('./scenario');

var originalEntryRecorder;
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
                .matchUsing($scenario.Matchers.requestKeyMatcher(requestKey))
                .respondWith(mockEntry);
        }
        
    };
}

function startRecordingScenario(title) {

    if (typeof activeScenarioBuilder === 'undefined') {
        console.log('|    Starting recording of new scenario');
        activeScenarioBuilder = new $scenario.Builder(title || ('Recorded Scenario ' + recordingCounter++));
        activeScenarioBuilder.sequentialScenario()
            .oneShot();
    }
    else {
        throw Error('A recording is already active, please finish it before starting a new one');
    }

}

function finishRecordingScenario() {

    if (typeof activeScenarioBuilder === 'undefined') {
        throw Error('No scenario is being recorded, cannot finish anything.');
    }
    else {
        console.log('|    Finishing recording of new scenario');
        var scenario = activeScenarioBuilder.build();
        activeScenarioBuilder = undefined;
        return scenario;
    }

}