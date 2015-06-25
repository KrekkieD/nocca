(function() {
    'use strict';

    angular.module('nocca.data')
        .factory('noccaDataConnection', noccaDataConnection);

    function noccaDataConnection (
        $websocket,
		noccaCoreConfig,
        $rootScope
    ) {

        var factory = {
			lastUpdate: 0,
			data: {
				responses: {},
				endpoints: {},
				recorded: [],
				forwarded: [],
				replayed: [],
				miss: [],
				storyLog: []
			}
        };

        load();

        // factory functions here
        return factory;

        function load () {

			var websocketServerUrl = 'ws://';

			if (noccaCoreConfig.servers.wrapperServer.enabled) {
				websocketServerUrl += noccaCoreConfig.servers.wrapperServer.wrapper.host || document.location.host;
				websocketServerUrl += noccaCoreConfig.servers.websocketServer.wrapper.path;
			}
			else {
				websocketServerUrl += noccaCoreConfig.servers.websocketServer.listen.hostname || document.location.hostname;
				websocketServerUrl += ':' + noccaCoreConfig.servers.websocketServer.listen.port;
			}

			var ws = $websocket.$new(websocketServerUrl);

			ws.$on('$message', function (data) {

				// merge data with factory data
				Object.keys(data).forEach(function (key) {

					factory.data[key] = data[key];
                    //
					//if (Array.isArray(data[key])) {
					//	Array.prototype.push.apply(
					//		factory.data[key],
					//		data[key]
					//	);
					//}
					//else if (data[key] instanceof Object) {
                    //
					//	Object.keys(data[key]).forEach(function (dataKey) {
                    //
					//		factory.data[key][dataKey] = data[key][dataKey];
                    //
					//	});
                    //
					//}

				});

				factory.lastUpdate = new Date().getTime();

				$rootScope.$apply();

			});

        }

    }

}());
