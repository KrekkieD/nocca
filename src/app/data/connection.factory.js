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
            api: {
                data: {}
            }
        };

        load();

        // factory functions here
        return factory.api;

        function load () {

            var ws = $websocket.$new(noccaDataOptions.host);

            ws.$on('$message', function (data) {

                Object.keys(factory.api.data).forEach(function (key) {
                    delete factory.api.data[key];
                });

                Object.keys(data).forEach(function (key) {
                    factory.api.data[key] = data[key];
                });

                $rootScope.$apply();

            });

        }

    }

}());
