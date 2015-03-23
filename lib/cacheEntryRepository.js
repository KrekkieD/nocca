'use strict';
var _ = require('lodash');
var $crypto = require('crypto');
var $utils = require('./utils');

module.exports = CacheEntries;

function CacheEntries (Nocca) {

    var recordings = {};

    this.considerRecording = considerRecordingRequest;
    this.matchRequest = simpleRequestKeyRequestMatcher;
    this.addRecording = addSingleRecording;
    this.exportRecordings = exportRecordings;
    this.name = function() { return 'memory-entries'; };
    this.type = function() { return Nocca.constants.RepositoryType.CACHES; };
    
    this.init = initRestRoutes;

// --- Simple recording playback
    
    function considerRecordingRequest(reqContext) {
        addSingleRecording(reqContext.endpoint.key, reqContext.requestKey, reqContext.getProxyResponse().dump());
        
        // Always accepts recordings
        return true;
    }
    
    function hashRequestKey(requestKey) { return $crypto.createHash('sha256').update(requestKey).digest('hex'); }

    function addSingleRecording (endpointKey, requestKey, recordedResponse) {

        // ensure presence of endpointKey
        recordings[endpointKey] = recordings[endpointKey] || {};

        var generatedHash = hashRequestKey(requestKey);
        
        recordings[endpointKey][generatedHash] = {
            _self: '/repositories/memory-caches/endpoints/' + endpointKey + '/caches/' + generatedHash,
            hash: generatedHash,
            requestKey: requestKey,
            playbackResponse: recordedResponse
        };

        return generatedHash;
    }
    
    function removeSingleRecording(endpointKey, requestKey) {
        
        removeSingleRecordingByHash(endpointKey, hashRequestKey(requestKey));

    }

    function removeSingleRecordingByHash(endpointKey, requestKeyHash) {

        if (recordings.hasOwnProperty(endpointKey)) {

            delete recordings[endpointKey][requestKeyHash];

        }

    }

    function simpleRequestKeyRequestMatcher (reqContext) {
        var playbackResponse = null;
        var requestKeyHash = hashRequestKey(reqContext.requestKey);
        
        if (typeof recordings[reqContext.endpoint.key] !== 'undefined' &&
            typeof recordings[reqContext.endpoint.key][requestKeyHash] !== 'undefined') {

            playbackResponse = Nocca.httpMessageFactory.createResponse(recordings[reqContext.endpoint.key][requestKeyHash].playbackResponse);

            Nocca.logInfo('Found a matching record using simpleMatcher!');

        }
        else {
            // Probably no recording found, just return the context as is
            Nocca.logDebug('No matching record found using simpleMatcher');
        }

        return playbackResponse;

    }

// --- Export data
    function exportRecordings (endpoint, key) {

        return (typeof endpoint !== 'undefined' && typeof key !== 'undefined') ? recordings[endpoint][key] : recordings ;

    }

// --- REST control methods

    function initRestRoutes() {

        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['GET:/repositories/memory-caches/endpoints/', getCachesForAllEndpoints]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['GET:/repositories/memory-caches/endpoints/:endpointKey/caches/', true, getCacheEntriesForEndpoint]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['GET:/repositories/memory-caches/endpoints/:endpointKey/caches/:requestKeyHash', true, getCacheEntryByKey]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['PUT:/repositories/memory-caches/endpoints/:endpointKey/caches/:requestKeyHash', true, saveOrReplaceCacheEntry]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['POST:/repositories/memory-caches/endpoints/:endpointKey/caches/', true, saveOrReplaceCacheEntry]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['DELETE:/repositories/memory-caches/endpoints/:endpointKey/caches/:requestKeyHash', true, deleteCacheEntry]);
        Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['POST:/caches/package', addCachePackage]);

    }

    function getCachesForAllEndpoints (apiReq) {
        apiReq.ok().end(JSON.stringify(recordings));
    }
    
    function getCacheEntriesForEndpoint (apiReq) {
        
        if (typeof recordings[apiReq.matches.endpointKey] !== 'undefined') {

            apiReq.ok().end(JSON.stringify(recordings[apiReq.matches.endpointKey]));
        }
        else {
            apiReq.notFound().end();
        }
    }

    function getCacheEntryByKey (apiReq) {

        if (typeof recordings[apiReq.matches.endpointKey] !== 'undefined' &&
            typeof recordings[apiReq.matches.endpointKey][apiReq.matches.requestKeyHash] !== 'undefined') {

            apiReq.ok().end(JSON.stringify(recordings[apiReq.matches.endpointKey][apiReq.matches.requestKeyHash]));
        }
        else {
            apiReq.notFound().end();
        }
    }

    function addCachePackage (apiReq) {
        $utils.readBody(apiReq.req).then(function(body) {

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

            apiReq.ok({
                'Content-Type': 'application/json'
            }).end(JSON.stringify(downloadObj));

        }).fail(function() {

            apiReq.badRequest().end('Request body could not be parsed, is it a valid JSON string?');

        });
    }
    
    function saveOrReplaceCacheEntry(apiReq) {
        $utils.readBody(apiReq.req).then(function(body) {
            
            body = JSON.parse(body);
            
            if (!_.has(body, 'requestKey') || !_.has(body, 'playbackResponse')) {
                apiReq.badRequest().end('Object requires at least a requestKey and response property');
                return;
            }
            
            var newHash = addSingleRecording(apiReq.matches.endpointKey, body.requestKey, body.playbackResponse);

            if (typeof apiReq.matches.requestKeyHash !== 'undefined' && newHash !== apiReq.matches.requestKeyHash) {
                // Request key changed, delete old entry
                removeSingleRecordingByHash(apiReq.matches.endpointKey, apiReq.matches.requestKeyHash);
            }

            apiReq.ok('Ok', { 'Location': '/repositories/memory-caches/endpoints/' + apiReq.matches.endpointKey + '/caches/' + newHash }).end();
            
        }).fail(function(errrrr) {
            
            apiReq.badRequest().end('Request body could not be parsed, is it a valid JSON string?');
            
        });
    }

    function deleteCacheEntry(apiReq) {

        if (typeof recordings[apiReq.matches.endpointKey] !== 'undefined' &&
            typeof recordings[apiReq.matches.endpointKey][apiReq.matches.requestKeyHash] !== 'undefined') {

            var entryToDelete = recordings[apiReq.matches.endpointKey][apiReq.matches.requestKeyHash];
            delete recordings[apiReq.matches.endpointKey][apiReq.matches.requestKeyHash];
            
            apiReq.ok().end(JSON.stringify(entryToDelete));
        }
        else {
            apiReq.notFound().end();
        }
        
    }




}
