'use strict';
var $utils = require('./utils');

module.exports = CacheEntries;

function CacheEntries (Nocca) {

    var recordings = {};

    this.considerRecording = considerRecordingRequest;
    this.matchRequest = simpleRequestKeyRequestMatcher;
    this.addRecording = addSingleRecording;
    this.exportRecordings = exportRecordings;
    this.name = function() { return 'memory-entries'; };
    
    this.init = initRestRoutes;

// --- Simple recording playback
    
    function considerRecordingRequest(reqContext) {
        addSingleRecording(reqContext.endpoint.key, reqContext.requestKey, reqContext.getProxyResponse());
    }

    function addSingleRecording (endpoint, requestKey, recordedResponse) {

        // ensure presence of endpoint
        recordings[endpoint] = recordings[endpoint] || {};

        recordings[endpoint][requestKey] = recordedResponse;

    }

    function simpleRequestKeyRequestMatcher (reqContext) {
        var response = null;
        
        if (typeof recordings[reqContext.endpoint.key] !== 'undefined' &&
            typeof recordings[reqContext.endpoint.key][reqContext.requestKey] !== 'undefined') {

            response = recordings[reqContext.endpoint.key][reqContext.requestKey];

            Nocca.logInfo('Found a matching record using simpleMatcher!');

        }
        else {
            // Probably no recording found, just return the context as is
            Nocca.logDebug('No matching record found using simpleMatcher');
        }

        return response;

    }

// --- Export data
    function exportRecordings (endpoint, key) {

        return (typeof endpoint !== 'undefined' && typeof key !== 'undefined') ? recordings[endpoint][key] : recordings ;

    }

// --- REST control methods

    function initRestRoutes() {

        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['GET:/caches', getCaches]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['PUT:/caches/memory-caches/:endpoint/:entryHash', true, saveOrReplaceCacheEntry]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['POST:/caches/package', addCachePackage]);

    }

    function getCaches (req, res, config, matches, writeHead, writeEnd) {
        writeHead(res, 200).writeEnd(JSON.stringify(exportRecordings(), null, 4));
    }

    function addCachePackage (req, res, config, matches, writeHead, writeEnd) {
        $utils.readBody(req).then(function(body) {

            body = JSON.parse(body);

            var recordings = exportRecordings();

            // extract from recordings
            var downloadObj = {};

            if (typeof body.requestKeys !== 'undefined') {
                body.requestKeys.forEach(function (value) {
                    downloadObj[value] = recordings[value];
                });
            }
            else {
                // if no keys specified just download all recorded
                downloadObj = recordings;
            }

            writeHead(res, 200, {
                'Content-Type': 'application/json'
            }).writeEnd(JSON.stringify(downloadObj));

        }).fail(function() {

            writeHead(res, 400).writeEnd('Request body could not be parsed, is it a valid JSON string?');

        });
    }
    
    function saveOrReplaceCacheEntry(req, res, config, matches, writeHead, writeEnd) {
        $utils.readBody(req).then(function(body) {
            
            body = JSON.parse(body);
            
            
            
        }).fail(function() {
            
            writeHead(res, 400).writeEnd('Request body could not be parsed, is it a valid JSON string?');
            
        });
    }





}
