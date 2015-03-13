'use strict';

var _ = require('lodash');
var $constants = require('./constants');
var $http = require('http');
var $q = require('q');
var $url = require('url');
var $urlPattern = require('url-pattern');
var $utils = require('./utils');
var $extend = require('extend');

// TODO: this should come from config!
var $scenarioRecorder = require('./scenarioRecorder');
// TODO: this should come from config!
var $scenario = require('./scenario');

module.exports = HttpApi;


// TODO: this is some very dirty encapsulation of functionality
// TODO: refactor: config can be read from Nocca and does not need to be passed as argument
function HttpApi (Nocca) {

    var self = this;

    // Configured routes will be collected in this map
    var routes = {
        direct: {},
        pattern: []
    };

    // Note that a handler configured with addRoute can get up to 4 parameters:
    //   req     - active request
    //   res     - active response
    //   config  - active Nocca config
    //   match   - match information on route (e.g. parameter values)
    
    // Configure routes
    addRoute('GET:/config', getConfig);
    addRoute('GET:/caches', getCaches);
    addRoute('POST:/caches/package', addCachePackage);
    addRoute('GET:/enums/scenarios/type', getEnumScenariosType);
    addRoute('GET:/enums/scenarios/repeatable', getEnumScenariosRepeatable);
    addRoute('GET:/scenarios/recorder', getRecorder);
    addRoute('PUT:/scenarios/recorder', changeRecorderState);
    addRoute('DELETE:/scenarios/recorder', cancelRecordingScenario);
    addRoute('OPTIONS:/scenarios/recorder', allowRecorderCall);
    addRoute('GET:/scenarios', getAllScenarios);
    addRoute('GET:/scenarios/:scenarioKey', true, getScenarioByKey);
    addRoute('GET:/scenarios/:scenarioKey/active', true, getScenarioStatusByKey);
    addRoute('DELETE:/scenarios/:scenarioKey/currentPosition', true, resetScenarioByKey);


    // Setup the HTTP server on instantiation and use the request router to handle all traffic
    self.server = $http.createServer(createRequestRouter(Nocca.config))

        .listen(Nocca.config.servers.httpApi.port, function () {
            Nocca.logSuccess('Port:', Nocca.config.servers.httpApi.port, '-- HTTP server');
        });


    // Wraps the request router in a closure to provide access to the configuration
    function createRequestRouter (config) {

        var router = requestRouter;
        router.config = config;

        return router;

        // Selects handlers from the routes map (routes are defined below)
        function requestRouter (req, res) {

            var route = req.method.toUpperCase() + ':' + $url.parse(req.url).path;
            Nocca.logDebug('Checking route: ' + route);
            
            if (routes.direct.hasOwnProperty(route)) {
                routes.direct[route](req, res, config);
            }
            else {
                var match, handler;
                for (var idx = 0; idx < routes.pattern.length && !match; idx++) {
                    if (match = routes.pattern[idx].match(route)) {
                        handler = routes.pattern[idx].handler;
                    }
                }

                if (typeof handler !== 'undefined') {
                    handler(req, res, config, match);
                }
                else {
                    res.writeHead(404, 'Not found', {
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.write('Could not open ' + req.url, function() {
                        res.end();
                    });
                }
            }

        }

    }

    // --- Route definitions

    // Adds a handler to the routes map using one or more route definitions (first argument can be an array)
    // Route definitions are of the form METHOD:/p/a/t/h
    // Further specialization on query parameters or headers is not provided
    function addRoute (routeStrings, isPattern, handler) {

        if (typeof handler === 'undefined') {
            handler = isPattern;
            isPattern = false;
        }

        // force routeStrings to array
        if (!_.isArray(routeStrings)) {
            routeStrings = [routeStrings];
        }

        routeStrings.forEach(function (routeDefinition) {
            if (isPattern) {
                var p = $urlPattern.newPattern(routeDefinition);
                p.handler = handler;
                routes.pattern.push(p);
            }
            else {
                routes.direct[routeDefinition] = handler;
            }
        });

    }


    function getConfig (req, res, config) {
        _writeHead(res, 200).writeEnd(JSON.stringify(config, null, 4));
    }

    function getCaches (req, res, config) {
        _writeHead(res, 200).writeEnd(JSON.stringify(config.playback.exporter(), null, 4));
    }

    function addCachePackage (req, res, config) {
        $utils.readBody(req, true).then(function(body) {

            var recordings = config.playback.exporter();

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

            _writeHead(res, 200, {
                'Content-Type': 'application/json'
            }).writeEnd(JSON.stringify(downloadObj));

        }).fail(function() {

            _writeHead(res, 400).writeEnd('Request body could not be parsed, is it a valid JSON string?');

        });
    }

    function allowRecorderCall (req, res) {

        _writeHead(res, 200, {
            'Allow': 'GET,PUT'
        }).writeEnd();

    }

    function getRecorder (req, res) {

        var recordingState = Nocca.scenarioRecorder.isRecording();
        if (recordingState !== false) {

            _writeHead(res, 200, {
                'Content-Type': 'application/json'
            }).writeEnd(JSON.stringify(recordingState));

        }
        else {

            _writeHead(res, 404).writeEnd();

        }

    }

    function changeRecorderState (req, res) {

        $utils.readBody(req, true)
            .then(function (body) {

                if (body.startRecording === true) {
                    startRecordingScenario(req, res, body);
                }
                else if (body.stopRecording === true) {
                    stopRecordingScenario(req, res, body);
                }
                else {
                    _writeHead(res, 400).writeEnd('Bad body content');
                }

            });

    }

    function startRecordingScenario (req, res, body) {
        try {
            var builder = Nocca.scenarioRecorder.startRecordingScenario(body);

            _writeHead(res, 200, {
                'Content-Type': 'application/json',
                'Location': '/scenarios/' + body.name
            }).writeEnd(JSON.stringify(builder.scenario));

        } catch (e) {
            switch (e.id) {
                case $constants.ERRORS.ALREADY_RECORDING:
                    _writeHead(res, 409, 'Already Recording');
                    break;
                case $constants.ERRORS.INCOMPLETE_OBJECT:
                    _writeHead(res, 400, 'Supply a name and title for the new scenario');
                    break;
                default:
                    _writeHead(res, 500);
            }

            _writeEnd(res, e.message);

        }
    }

    function stopRecordingScenario (req, res, body) {
        try {
            var scriptOutputDir = undefined;
            if (Nocca.config.scenarios.writeNewScenarios && Nocca.config.scenarios.scenarioOutputDir) {
                scriptOutputDir = Nocca.config.scenarios.scenarioOutputDir;
            }

            var scenario = Nocca.scenarioRecorder.finishRecordingScenario(scriptOutputDir);


            var parsedUrl = $url.parse(req.url, true);
            // TODO: commented out the IF, does not seem the proper location to set this
            //if (parsedUrl.query && parsedUrl.query['save'] == 'true') {
                Nocca.config.playback.scenarioRecorder(scenario.player());
            //}

            _writeHead(res, 200, {
                'Content-Type': 'application/json'
            }).writeEnd(JSON.stringify(scenario));

        } catch (e) {

            Nocca.logError(e);
            _writeHead(res, 409, 'Finish Recording Failed').writeEnd(e.message);

        }
    }

    function cancelRecordingScenario (req, res, body) {

        try {
            var scriptOutputDir = undefined;
            var scenario = Nocca.scenarioRecorder.finishRecordingScenario(scriptOutputDir);

            _writeHead(res, 200, {
                'Content-Type': 'application/json'
            }).writeEnd(JSON.stringify(scenario));

        } catch (e) {
            _writeHead(res, 409, 'Finish Recording Failed').writeEnd(e.message);
        }

    }

    function getEnumScenariosType (req, res) {
        _writeHead(res).writeEnd(JSON.stringify($scenario.TYPE));
    }

    function getEnumScenariosRepeatable (req, res) {
        _writeHead(res).writeEnd(JSON.stringify($scenario.REPEATABLE));
    }

    function getAllScenarios(req, res) {
        _writeHead(res).writeEnd(JSON.stringify(config.playback.scenarioExporter()));
    }
    
    function getScenarioByKey (req, res, config, params) {
        try {

            _writeHead(res)
                .writeEnd(JSON.stringify(config.playback.scenarioExporter(params.scenarioKey)));

        } catch (e) {
            _writeHead(res, 404).writeEnd();
        }
    }

    function getScenarioStatusByKey (req, res, config, params) {
        // TODO: noooo, you're dependant on the $$active property now! Blegh
        try {
            _writeHead(res)
                .writeEnd(JSON.stringify(config.playback.scenarioExporter(params.scenarioKey).$$active));

        } catch (e) {
            _writeHead(res, 404).writeEnd();
        }
    }

    function resetScenarioByKey(req, res, config, params) {
        try {
            config.playback.scenarioResetter(params.scenarioKey);

            _writeHead(res)
                .writeEnd(JSON.stringify(config.playback.scenarioExporter(params.scenarioKey).currentPosition));

        } catch (e) {
            _writeHead(res, 404).writeEnd();
        }


    }

    function _writeHead (res, statusCode, statusMessage, headers) {

        var writeHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,PUT,DELETE',
            'Access-Control-Allow-Headers': 'content-type'
        };

        statusCode = statusCode || 200;
        statusMessage = statusMessage || $http.STATUS_CODES[statusCode];

        if (typeof headers === 'undefined' &&
            typeof statusMessage === 'object') {

            headers = statusMessage;
            statusMessage = $http.STATUS_CODES[statusCode];

        }

        if (typeof headers === 'object') {
            // add headers for cross domain access
            writeHeaders = $extend(true, {}, writeHeaders, headers);
        }

        res.writeHead(statusCode, statusMessage, writeHeaders);

        return {
            writeEnd: function (data) {
                _writeEnd(res, data);
            }
        };

    }

    function _writeEnd (res, data) {

        if (typeof data !== 'undefined') {
            res.write(data, function () {
                res.end();
            });
        }
        else {
            res.end();
        }

    }

}
