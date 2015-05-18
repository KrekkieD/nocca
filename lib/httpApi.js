'use strict';

var _ = require('lodash');
var $http = require('http');
var $q = require('q');
var $url = require('url');
var $urlPattern = require('url-pattern');
var $extend = require('extend');

module.exports = HttpApi;

function HttpApi (Nocca) {

    var self = this;

	// Setup the HTTP server on instantiation and use the request router to handle all traffic
	self.server = $http.createServer(createRequestRouter(Nocca.config));

	// Configured routes will be collected in this map
	var routes = {
		direct: {},
		pattern: [],
        help: []
	};

	// wait for all config to have rendered before continuing
	Nocca.pubsub.subscribe(Nocca.constants.PUBSUB_NOCCA_INITIALIZE_PLUGIN, init);

	// Listen to additional routes being added by loaded plugins
	Nocca.pubsub.subscribe(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, addRoute);

	function init () {

		Nocca.getConfig('servers.httpApi.listen', Nocca.config, true)
			.then(function (config) {

				if (config !== false) {

					var args = [];

					config.port && args.push(config.port);
					config.hostname && args.push(config.hostname);

					args.push(function () {
						args.pop();
						Nocca.logSuccess(args.join(', '), '-- HTTP API');
					});

					self.server.listen.apply(self.server, args);

				}

			});

		// Configure routes
		addRoute('GET:/routes', getRoutes);

	}





    // Note that a handler configured with addRoute can get up to 4 parameters:
    //   req     - active request
    //   res     - active response
    //   config  - active Nocca config
    //   match   - match information on route (e.g. parameter values)
    




    // Wraps the request router in a closure to provide access to the configuration
    function createRequestRouter (config) {

        var router = requestRouter;
        router.config = config;

        return router;

        // Selects handlers from the routes map (routes are defined below)
        function requestRouter (req, res) {

            var route = req.method.toUpperCase() + ':' + $url.parse(req.url).pathname;
            Nocca.logDebug('Checking route: ' + route);

            if (routes.direct.hasOwnProperty(route)) {
                invokeRoute(routes.direct[route], req, res);//(req, res, config, null, _writeHead, _writeEnd);
            }
            else {
                var match, handler;
                for (var idx = 0; idx < routes.pattern.length && !match; idx++) {
                    if (match = routes.pattern[idx].match(route)) {
                        handler = routes.pattern[idx].handler;
                    }
                }

                if (typeof handler !== 'undefined') {
                    invokeRoute(handler, req, res, match);//, config, match, _writeHead, _writeEnd);
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
    
    function invokeRoute(handler, req, res, matches) {
        handler(new ApiRequest(req, res, matches));
    }

    // --- Route definitions

    // Adds a handler to the routes map using one or more route definitions (first argument can be an array)
    // Route definitions are of the form METHOD:/p/a/t/h
    // Further specialization on query parameters or headers is not provided
    function addRoute (routeStrings, isPattern, handler) {

        // convert arguments to array
        var args = Array.prototype.slice.call(arguments);

        // always first arg, extract
        var routeStrings = args.shift();

        var isPattern = typeof args[0] === 'boolean' ? args.shift() : false;
        var handler = args.shift();
        var helpText = args.length ? args.shift() : undefined;

        Nocca.logDebug('Adding route to REST api: ' + routeStrings);

        // force routeStrings to array
        if (!Array.isArray(routeStrings)) {
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

            // add route to help for reference
            var routeParts = routeDefinition.split(/:/);
            routes.help.push({
                method: routeParts[0],
                path: routeParts[1],
                description: helpText
            });
        });

    }

    function getRoutes (apiReq) {
        apiReq.ok().end(routes.help);
    }


	function ApiRequest (req, res, matches) {
		this.req = req;
		this.res = res;
		this.matches = matches;
		this.headWritten = false;
	}

	ApiRequest.prototype.nocca = function() { return Nocca; };
	ApiRequest.prototype.writeHead = function (statusCode, statusMessage, headers) {

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

		this.res.writeHead(statusCode, statusMessage, writeHeaders);
		this.headWritten = true;

		return this;

	};
	ApiRequest.prototype.end = function (data, noJson) {

		// check if data is an object and not null
		if (data && !noJson) {
			// stringify! what a convenience.

            // pretty print?
            var parsedUrl = $url.parse(this.req.url, true);
            if (parsedUrl.query.jsonPrettyPrint === 'true') {
                data = JSON.stringify(data, null, 4);
            }
            else {
                data = JSON.stringify(data);
            }
		}

		this.res.end(data);

	};

	ApiRequest.prototype.ok            = function(message, headers) { return this.writeHead(200, message, headers); };
	ApiRequest.prototype.moved         = function(message, headers) { return this.writeHead(301, message, headers); };
	ApiRequest.prototype.badRequest    = function(message, headers) { return this.writeHead(400, message, headers); };
	ApiRequest.prototype.notFound      = function(message, headers) { return this.writeHead(404, message, headers); };
	ApiRequest.prototype.conflict      = function(message, headers) { return this.writeHead(409, message, headers); };
	ApiRequest.prototype.internalError = function(message, headers) { return this.writeHead(500, message, headers); };

}
