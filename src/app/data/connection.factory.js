(function() {
    'use strict';

    angular.module('nocca.data')
        .factory('noccaDataConnection', noccaDataConnection);

    function noccaDataConnection (
        $websocket,
        noccaDataOptions
    ) {
        // values here

        var factory = {
            data: {
                src: {}
            }
        };

        load();

        // factory functions here
        return factory;

        function load () {

            var ws = $websocket.$new(noccaDataOptions.host);

            ws.$on('$message', function (data) {
                console.log('The websocket server has sent the following data:');
                console.log(data);

                factory.data.src = data;
            });

            //ws.$close();

        }

    }

}());
