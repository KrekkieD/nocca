'use strict';
// TODO: should be instance! cannot use Nocca reference
var $q = require('q');

module.exports = Cacheentries;

function Cacheentries (Nocca) {

    var recordings = {};

    this.defaultRequestMatcher = combineMatchers(scenarioBasedRequestMatcher, simpleRequestKeyRequestMatcher);
    this.simpleRequestKeyRequestMatcher = combineMatchers(simpleRequestKeyRequestMatcher);
    this.addRecording = addSingleRecording;
    this.exportRecordings = exportRecordings;

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

// --- Export data
    function exportRecordings (endpoint, key) {

        return (typeof endpoint !== 'undefined' && typeof key !== 'undefined') ? recordings[endpoint][key] : recordings ;

    }

}
