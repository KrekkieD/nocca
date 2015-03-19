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

            var ws = $websocket.$new(noccaDataOptions.host);

            ws.$on('$message', function (data) {

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
