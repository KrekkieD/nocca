'use strict';

var $connect = require('connect');

module.exports = WrapperServer;

function WrapperServer (Nocca) {

	var self = this;

	self.server = $connect();

	// collect server configs
	Nocca.getConfig('servers', Nocca.config, true)
		.then(function (serverConfig) {

			serverConfig.gui.enabled &&
				self.server.use(
					serverConfig.gui.wrapper.path,
					Nocca.gui.server
				);

			serverConfig.proxy.enabled &&
				self.server.use(
					serverConfig.proxy.wrapper.path,
					Nocca.proxy.server
				);

			serverConfig.httpApi.enabled &&
				self.server.use(
					serverConfig.httpApi.wrapper.path,
					Nocca.httpApi.server
				);

			serverConfig.websocketServer.enabled &&
				self.server.use(
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
						serverConfig.gui.wrapper.host,
						serverConfig.gui.wrapper.path,
						'-- GUI server'
					);

				serverConfig.proxy.enabled &&
					Nocca.logSuccess(
						serverConfig.proxy.wrapper.host,
						serverConfig.proxy.wrapper.path,
						'-- Proxy server'
					);

				serverConfig.httpApi.enabled &&
					Nocca.logSuccess(
						serverConfig.httpApi.wrapper.host,
						serverConfig.httpApi.wrapper.path,
						'-- Http API server'
					);

				serverConfig.websocketServer.enabled &&
					Nocca.logSuccess(
						serverConfig.websocketServer.wrapper.host,
						serverConfig.websocketServer.wrapper.path,
						'-- Websocket server'
					);

			});

			self.server.listen.apply(self.server, args);
			//
			//
			//self.server.listen(Nocca.config.servers.wrapperServer.listen.port, function () {
			//
			//	Nocca.logSuccess('Port:', Nocca.config.servers.wrapperServer.listen.port, '-- Wrapper server');
			//
			//	serverConfig.gui.enabled &&
			//	Nocca.logSuccess('ContextRoot:', serverConfig.gui.wrapper.path, '-- GUI server');
			//
			//	serverConfig.proxy.enabled &&
			//	Nocca.logSuccess('ContextRoot:', serverConfig.proxy.wrapper.path, '-- Proxy server');
			//
			//	serverConfig.httpApi.enabled &&
			//	Nocca.logSuccess('ContextRoot:', serverConfig.httpApi.wrapper.path, '-- Http API server');
			//
			//	serverConfig.websocketServer.enabled &&
			//	Nocca.logSuccess('ContextRoot:', serverConfig.websocketServer.wrapper.path, '-- Websocket server');
			//});
			//
		});



}
