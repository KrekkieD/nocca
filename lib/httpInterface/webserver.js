'use strict';

var _ = require('lodash');
var $http = require('http');
var $url = require('url');
var $urlPattern = require('url-pattern');

// TODO: this should come from config!
var $scenarioRecorder = require('../scenarioRecorder');
// TODO: this should come from config!
var $scenario = require('../scenario');

module.exports = HttpServer;


// TODO: this was some very dirty encapsulation
// TODO: refactor: config can be read from Nocca and does not need to be passed as argument
function HttpServer (Nocca) {

    var self = this;

    // Configured routes will be collected in this map
    var routes = {
        direct: {},
        pattern: []
    };

    // Configure routes
    addRoute('GET:/config', getConfig);
    addRoute('GET:/caches', getCaches);
    addRoute('POST:/caches/package', addCachePackage);
    addRoute('GET:/enums/scenarios/type', getEnumScenariosType);
    addRoute('GET:/enums/scenarios/repeatable', getEnumScenariosRepeatable);
    addRoute('POST:/scenarios/startRecording', startRecordingScenario);
    addRoute('POST:/scenarios/finishRecording', stopRecordingScenario);
    addRoute('GET:/scenarios/:scenarioKey', true, getScenarioByKey);
    addRoute('GET:/scenarios/:scenarioKey/active', true, getScenarioStatusByKey);


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

            var route = req.method.toUpperCase() + ':' + $url.parse(req.url).pathname;

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
        res.write(JSON.stringify(config, null, 4), function () {
            res.end();
        });
    }

    function getCaches (req, res, config) {
        res.write(JSON.stringify(config.playback.exporter(), null, 2), function () {
            res.end();
        });
    }

    function addCachePackage (req, res, config) {
        var body = '';

        req.on('data', function (chunk) {
            body += chunk;
        });

        req.on('end', function () {

            if (body !== '') {
                try {
                    body = JSON.parse(body);
                }
                catch (e) {
                    res.writeHead(400, 'Bad request', {
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.write('Request body could not be parsed, is it a valid JSON string?');
                    res.end();
                }
            }

            // if no req body was sent in body is not an object but empty string
            if (body === '') {
                body = {};
            }

            var recordings = router.config.playback.exporter();

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


            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            });

            res.write(JSON.stringify(downloadObj), function () {
                res.end();
            });

        });
    }

    function startRecordingScenario (req, res, config) {
        try {
            var parsedUrl = $url.parse(req.url);
            var title = (parsedUrl.query && parsedUrl.query.title) ? parsedUrl.query.title : undefined;

            $scenarioRecorder.startRecordingScenario(title);
            res.write('Started recording', function() {
                res.end();
            });
        } catch (e) {
            res.writeHead(409, 'Already Recording');
            res.write('Recording is already active', function() {
                res.end();
            });
        }
    }

    function stopRecordingScenario (req, res, config) {
        try {
            var scriptOutputDir = undefined;
            if (config.scenarios.writeNewScenarios && config.scenarios.scenarioOutputDir) {
                scriptOutputDir = config.scenarios.scenarioOutputDir;
            }

            var scenario = $scenarioRecorder.finishRecordingScenario(scriptOutputDir);


            var parsedUrl = $url.parse(req.url, true);
            if (parsedUrl.query && parsedUrl.query['save'] == 'true') {
                console.log(scenario);
                config.playback.scenarioRecorder(scenario.player());
            }

            res.write(JSON.stringify(scenario), function() {
                res.end();
            });
        } catch (e) {
            res.writeHead(409, 'Finish Recording Failed');
            res.write(e.message, function() {
                res.end();
            });
        }
    }

    function getEnumScenariosType (req, res) {
        res.write(JSON.stringify($scenario.TYPE), function() { res.end(); });
    }

    function getEnumScenariosRepeatable (req, res) {
        res.write(JSON.stringify($scenario.REPEATABLE), function() { res.end(); });
    }

    function getScenarioByKey (req, res, config, params) {
        try {
            res.write(JSON.stringify(config.playback.scenarioExporter(params.scenarioKey)), function () {
                res.end();
            });
        } catch (e) {
            res.writeHead(404);
            res.end();
        }
    }

    function getScenarioStatusByKey (req, res, config, params) {
        // TODO: noooo, you're dependant on the $$active property now! Blegh
        try {
            res.write(JSON.stringify(config.playback.scenarioExporter(params.scenarioKey).$$active), function () {
                res.end();
            });
        } catch (e) {
            res.writeHead(404);
            res.end();
        }
    }

}
