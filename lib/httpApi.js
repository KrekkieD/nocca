'use strict';

var _ = require('lodash');
var $constants = require('./constants');
var $http = require('http');
var $q = require('q');
var $url = require('url');
var $urlPattern = require('url-pattern');
var $utils = require('./utils');
var $extend = require('extend');

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
    addRoute('GET:/enums/scenarios/type', getEnumScenariosType);
    addRoute('GET:/enums/scenarios/repeatable', getEnumScenariosRepeatable);

    // Listen to additional routes being added by loaded plugins
    Nocca.pubsub.subscribe(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, addRoute);


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
                routes.direct[route](req, res, config, null, _writeHead, _writeEnd);
            }
            else {
                var match, handler;
                for (var idx = 0; idx < routes.pattern.length && !match; idx++) {
                    if (match = routes.pattern[idx].match(route)) {
                        handler = routes.pattern[idx].handler;
                    }
                }

                if (typeof handler !== 'undefined') {
                    handler(req, res, config, match, _writeHead, _writeEnd);
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
        
        Nocca.logDebug('Adding route to REST api: ' + routeStrings);

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

    function getEnumScenariosType (req, res) {
        _writeHead(res).writeEnd(JSON.stringify($scenario.TYPE));
    }

    function getEnumScenariosRepeatable (req, res) {
        _writeHead(res).writeEnd(JSON.stringify($scenario.REPEATABLE));
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
