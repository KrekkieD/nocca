'use strict';

var $connect = require('connect');
var $http = require('http');

module.exports = WrapperServer;

function WrapperServer (Nocca) {

	var self = this;

	self.app = $connect();
	self.server = $http.createServer(self.app);

	Nocca.pubsub.subscribe(Nocca.constants.PUBSUB_NOCCA_INITIALIZE_PLUGIN, init);


	function init () {

		// collect server configs
		Nocca.getConfig('servers', Nocca.config, true)
			.then(function (serverConfig) {

				serverConfig.gui.enabled &&
					self.app.use(
						serverConfig.gui.wrapper.path,
						Nocca.gui.server
					);

				serverConfig.proxy.enabled &&
					self.app.use(
						serverConfig.proxy.wrapper.path,
						Nocca.proxy.server
					);

				serverConfig.httpApi.enabled &&
					self.app.use(
						serverConfig.httpApi.wrapper.path,
						Nocca.httpApi.server
					);

				serverConfig.websocketServer.enabled &&
					self.app.use(
						serverConfig.websocketServer.wrapper.path,
						Nocca.websocketServer.server
					);

				var args = [];

				serverConfig.wrapperServer.listen.port &&
					args.push(serverConfig.wrapperServer.listen.port);

				serverConfig.wrapperServer.listen.hostname &&
					args.push(serverConfig.wrapperServer.listen.hostname);


				args.push(function () {

					args.pop();

					Nocca.logSuccess(args.join(', '), '-- WRAPPER SERVER');

					serverConfig.gui.enabled &&
						Nocca.logSuccess(
							serverConfig.gui.wrapper.path,
							'-- GUI server'
						);

					serverConfig.proxy.enabled &&
						Nocca.logSuccess(
							serverConfig.proxy.wrapper.path,
							'-- Proxy server'
						);

					serverConfig.httpApi.enabled &&
						Nocca.logSuccess(
							serverConfig.httpApi.wrapper.path,
							'-- Http API server'
						);

					serverConfig.websocketServer.enabled &&
						Nocca.logSuccess(
							serverConfig.websocketServer.wrapper.path,
							'-- Websocket server'
						);

				});

				self.server.listen.apply(self.server, args);

			});

	}


}
