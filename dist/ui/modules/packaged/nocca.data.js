(function() {
    'use strict';

    angular.module('nocca.data', []);

}());

(function() {
    'use strict';

    angular.module('nocca.data')
        .filter('noccaDataUnique', noccaDataUnique);

    function noccaDataUnique () {

        return function (arr, field) {

            var trackingObject = {};
            var returnArray = [];

            for (var i = 0, iMax = arr.length; i < iMax; i += 1) {

                var matchValue = arr[i];

                if (typeof arr[i] === 'object') {
                    matchValue = arr[i][field];
                }

                if (typeof trackingObject[matchValue] === 'undefined') {
                    returnArray.push(arr[i]);
                }

                trackingObject[matchValue] = arr[i];

            }

            return returnArray;
        };

    }

}());
(function() {
    'use strict';

    angular.module('nocca.data')
        .value('noccaDataOptions', {
            host: 'ws://localhost:3005'
        });
}());

(function() {
    'use strict';

    angular.module('nocca.data')
        .filter('noccaDataObjectLength', noccaDataObjectLength);

    function noccaDataObjectLength () {

        return function (obj) {

			var length = 0;
			if (typeof obj === 'object') {
				length = Object.keys(obj).length;
			}
			return length;

        };

    }

}());
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
    
    noccaDataConnection.$inject = ['$websocket', 'noccaDataOptions', '$rootScope'];

}());
