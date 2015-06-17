'use strict';

var $extend = require('extend');

var $utils = require('../utils');


module.exports = {
	interface: 'httpApi',
	id: 'reKeyCaches',
	name: 'reKey caches',
	constructor: reKeyCaches
};

function reKeyCaches (Nocca) {

	var self = this;

	self.invoke = invoke;

	function invoke (pluginConfig) {

		// initialize plugin when Nocca says it's ok to do so
		if (!Nocca.initialized) {
			Nocca.pubsub.subscribe(Nocca.constants.PUBSUB_NOCCA_INITIALIZE_PLUGIN, _init);
		}
		else {
			_init();
		}

		return function (reqContext) {
			return delay(reqContext, pluginConfig);
		};

	}

	function _init () {

		// add routes
		var routes = [

			// remove all cacheList sessions
			['POST:/plugins/reKeyCaches', apiRekeyCaches, 'Returns caches by recreating the requestKey from the clientRequest']
		];

		routes.forEach(function (routeConfig) {
			Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, routeConfig);
		});

	}

	function apiRekeyCaches (apiReq) {

		$utils.readBody(apiReq.req)
			.then(function(body) {

				var caches = JSON.parse(body);

				if (Array.isArray(caches)) {

					var startTime = new Date().getTime();

					// duplicate the options object to prevent manipulation of the main config
					var options = $extend({}, Nocca.config);


					var newCaches = [];

					caches.forEach(function (cache) {

						// create a new requestContext so we can use its API
						var requestContext = new RequestContext(null, null, startTime, options);

						// required, actually
						if (typeof cache.clientRequest !== 'undefined') {
							requestContext.setClientRequest(cache.clientRequest);
						}

						if (typeof cache.proxyRequest !== 'undefined') {
							requestContext.setProxyRequest(cache.proxyRequest);
						}

						if (typeof cache.playbackResponse !== 'undefined') {
							requestContext.setPlaybackResponse(cache.playbackResponse);
						}

						// actually re-key it
						requestContext = requestContext.generateKey(requestContext);

						// extract the cache and add to newCaches
						newCaches.push(_extractRecording(requestContext));

					});

					apiReq.ok().end(JSON.stringify(newCaches, null, 4));

				}
				else {

					apiReq.badRequest().end('Payload should be an array of caches');

				}

			}).fail(function() {

				apiReq.badRequest().end('Unable to read request');

			});

	}

	function _extractRecording (reqContext) {

		var recording = {};

		recording.requestKey = reqContext.requestKey;
		recording.endpointKey = reqContext.endpoint.key;

		// incoming to nocca
		recording.clientRequest = reqContext.getClientRequest().dump();

		// prepared to go out
		recording.proxyRequest = reqContext.getProxyRequest().dump();

		// the response to send back to the client
		recording.playbackResponse = reqContext.getHttpMessage(reqContext.config.recordingSubject).dump();

		return recording;

	}


}
