'use strict';

// TODO: should $scenario not come from config?
var $scenario = require('./scenario');
var $fs = require('fs');

module.exports = {};
module.exports.scenarioEntryRecorderFactory = scenarioEntryRecorderFactory;
module.exports.startRecordingScenario = startRecordingScenario;
module.exports.finishRecordingScenario = finishRecordingScenario;



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

function startRecordingScenario(options) {
    
    if (typeof activeScenarioBuilder === 'undefined') {
        if (!options.hasOwnProperty('name')) { throw Error('A new scenario must have a name'); }
        
        console.log('|    Starting recording of new scenario');
        activeScenarioBuilder = new $scenario.Builder(options.name, options.title || ('Recorded Scenario ' + recordingCounter++));
    
        // This if is currently commented out, because there is only one type, so it is also the default
        //if (options.type === $scenario.TYPE.SEQUENTIAL) {
        activeScenarioBuilder.sequentialScenario();
        //}
        if (options.repeatable === $scenario.REPEATABLE.ONE_SHOT) {
            activeScenarioBuilder.oneShot();
        }
        else {
            activeScenarioBuilder.infiniteLoop();
        }

        return activeScenarioBuilder;
    }
    else {
        throw Error('A recording is already active, please finish it before starting a new one');
    }

}

function finishRecordingScenario(scriptOutputDir) {

    if (typeof activeScenarioBuilder === 'undefined') {
        throw Error('No scenario is being recorded, cannot finish anything.');
    }
    else {
        console.log('|    Finishing recording of new scenario');
        var scenario = activeScenarioBuilder.build();
        
        if (typeof scriptOutputDir !== 'undefined') {

            var filename = scriptOutputDir + '/scenario_' + scenario.name + '.js';
            $fs.writeFile(filename, $scenario.Serializer(scenario), function(err) {
                if (err) { throw err; }
                console.log('|      Saved serialized scenario to file: ' + filename);
            });
            
        }
        
        activeScenarioBuilder = undefined;
        return scenario;
    }

}