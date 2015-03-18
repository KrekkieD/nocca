'use strict';
// TODO: should be instance! cannot use Nocca reference
var $q = require('q');

module.exports = ScenarioRepository;

function ScenarioRepository (Nocca) {

    var scenarios = {};
    var scenarioEndpointBindings = {};

    this.defaultRequestMatcher = combineMatchers(scenarioBasedRequestMatcher, simpleRequestKeyRequestMatcher);
    this.simpleRequestKeyRequestMatcher = combineMatchers(simpleRequestKeyRequestMatcher);
    this.scenarioBasedRequestMatcher = combineMatchers(scenarioBasedRequestMatcher);
    this.addRecording = addSingleRecording;
    this.addScenario = addSingleScenario;
    this.exportRecordings = exportRecordings;
    this.exportScenarios = exportScenarios;
    this.resetScenario = resetScenario;

    function combineMatchers() {

        var matchers = unwrapMatchers(Array.prototype.slice.call(arguments));
        if (matchers.length === 0) { throw Error('Need at least one matcher!'); }

        var matcherFunction = function (reqContext) {
            var d = $q.defer();

            for (var i = 0; i < matchers.length && !reqContext.getPlaybackResponse(); i++) {
                matchers[i](reqContext);
            }

            d.resolve(reqContext);
            return d.promise;
        };

        matcherFunction.matchers = matchers;

        return matcherFunction;

    }

    function unwrapMatchers(matchers) {
        var unwrappedMatchers = [];

        for (var i = 0; i < matchers.length; i++) {
            if (matchers[i].matchers) {
                unwrappedMatchers = unwrappedMatchers.concat(matchers[i].matchers);
            }
            else {
                unwrappedMatchers.push(matchers[i]);
            }
        }

        return unwrappedMatchers;
    }

    function SingleShotReplayer(Nocca) {

        var self = this;

        self.addRecording = addRecording;

        var recordings = {};

        function addRecording() {


        }

    }

// --- Simple recording playback

    function addSingleRecording (endpoint, requestKey, recordedResponse) {

        // ensure presence of endpoint
        recordings[endpoint] = recordings[endpoint] || {};

        recordings[endpoint][requestKey] = recordedResponse;

    }

    function simpleRequestKeyRequestMatcher (reqContext) {
        var deferred = $q.defer();

        if (typeof recordings[reqContext.endpoint.key] !== 'undefined' &&
            typeof recordings[reqContext.endpoint.key][reqContext.requestKey] !== 'undefined') {

            reqContext.setPlaybackResponse(recordings[reqContext.endpoint.key][reqContext.requestKey]);

            Nocca.logInfo('Found a matching record using simpleMatcher!');

        }
        else {
            // Probably no recording found, just return the context as is
            Nocca.logDebug('No matching record found using simpleMatcher');
        }

        deferred.resolve(reqContext);

        return deferred.promise;

    }

// --  Scenario based playback (includes adding scenarios to the datastore)

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

            Nocca.logSuccess('Playing scenario request: ' + potentialScenarios[0].scenario.title + ' -- ' + potentialScenarios[0].currentPosition.state.title);

            var playbackResponse = Nocca.httpMessageFactory.createResponse(potentialScenarios[0].currentPosition.state.response.playbackResponse);

            reqContext.setPlaybackResponse(playbackResponse);

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
    function exportRecordings (endpoint, key) {

        return (typeof endpoint !== 'undefined' && typeof key !== 'undefined') ? recordings[endpoint][key] : recordings ;

    }

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

}
