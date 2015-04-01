'use strict';

var $nocca = require('../../index');
var $connect = require('connect');

var Nocca = new $nocca({
	endpoints: {
		'google': {
			targetBaseUrl: 'http://www.google.com/'
		},
		'yahoo': {
			targetBaseUrl: 'http://www.yahoo.com/'
		},
		'_default': {
			targetBaseUrl: 'http://localhost:3004/'
		}
	}
});
//
//var app = $connect();
//app.use(Nocca.gui.server);
//app.use(Nocca.config.servers.proxy.contextRoot, Nocca.proxy.server);
//app.use(Nocca.config.servers.httpApi.contextRoot, Nocca.httpApi.server);
//app.use(Nocca.config.servers.websocketServer.contextRoot, Nocca.websocketServer.server);
//app.listen(8989);
