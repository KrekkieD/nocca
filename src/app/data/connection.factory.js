(function() {
    'use strict';

    angular.module('nocca.data')
        .factory('noccaDataConnection', noccaDataConnection);

    function noccaDataConnection (
        $websocket,
        noccaDataOptions,
        $rootScope
    ) {
        // values here


        var factory = {
            hasConnection: true,
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

        function cleanData () {

            Object.keys(factory.data.responses).forEach(function (key) {
                delete factory.data.responses[key];
            });

            Object.keys(factory.data.endpoints).forEach(function (key) {
                delete factory.data.endpoints[key];
            });

            factory.data.recorded.length = 0;
            factory.data.forwarded.length = 0;
            factory.data.replayed.length = 0;
            factory.data.miss.length = 0;
            factory.data.storyLog.length = 0;

        }

        function load () {

            var ws = $websocket.$new(noccaDataOptions.host);

            ws.$on('$close', function () {
                factory.hasConnection = false;
                $rootScope.$apply();
            });
            ws.$on('$error', function () {
                factory.hasConnection = false;
                $rootScope.$apply();
            });

            ws.$on('$open', function () {
                // new connection means new data
                cleanData();

                factory.hasConnection = true;
                $rootScope.$apply();
            });

            ws.$on('$message', function (data) {

                factory.hasConnection = true;

                // merge data with factory data
				Object.keys(data).forEach(function (key) {

					if (Array.isArray(data[key])) {
						Array.prototype.push.apply(
							factory.data[key],
							data[key]
						);
					}
					else if (data[key] instanceof Object) {

						Object.keys(data[key]).forEach(function (dataKey) {

							factory.data[key][dataKey] = data[key][dataKey];

						});


					}

				});

				factory.lastUpdate = new Date().getTime();

                $rootScope.$apply();

            });

        }

    }

}());
