'use strict';

var $connect = require('connect');

module.exports = WrapperServer;

function WrapperServer (Nocca) {

	// collect server configs
	var serverConfig = Nocca.getConfig('servers', Nocca.config);

	this.server = $connect();

	serverConfig.gui.enabled &&
		this.server.use(serverConfig.gui.contextRoot, Nocca.gui.server);

	serverConfig.proxy.enabled &&
		this.server.use(serverConfig.proxy.contextRoot, Nocca.proxy.server);

	serverConfig.httpApi.enabled &&
		this.server.use(serverConfig.httpApi.contextRoot, Nocca.httpApi.server);

	serverConfig.websocketServer.enabled &&
		this.server.use(serverConfig.websocketServer.contextRoot, Nocca.websocketServer.server);

	this.server.listen(Nocca.config.servers.wrapperServer.listen.port, function () {

		Nocca.logSuccess('Port:', Nocca.config.servers.wrapperServer.listen.port, '-- Wrapper server');

		serverConfig.gui.enabled &&
			Nocca.logSuccess('ContextRoot:', serverConfig.gui.contextRoot, '-- GUI server');

		serverConfig.proxy.enabled &&
			Nocca.logSuccess('ContextRoot:', serverConfig.proxy.contextRoot, '-- Proxy server');

		serverConfig.httpApi.enabled &&
			Nocca.logSuccess('ContextRoot:', serverConfig.httpApi.contextRoot, '-- Http API server');

		serverConfig.websocketServer.enabled &&
			Nocca.logSuccess('ContextRoot:', serverConfig.websocketServer.contextRoot, '-- Websocket server');
	});

}
