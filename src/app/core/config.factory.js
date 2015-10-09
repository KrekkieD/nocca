'use strict';

require('./module')
    .factory('noccaCoreConfig', noccaCoreConfig);

function noccaCoreConfig ($http) {
    // values here

    var promise;

    var factory = {
        getConfig: getConfig
    };

    // factory functions here
    return factory;

    function getConfig () {

        if (!promise) {

            promise = $http({
                method: 'get',
                url: 'noccaConfig.json'
            }).then(function (response) {

                angular.extend(factory, response.data);
                return response.data;
            });

        }

        return promise;

    }

}
