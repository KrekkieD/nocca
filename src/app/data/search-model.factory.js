(function() {
    'use strict';

    angular.module('nocca.data')
        .factory('noccaDataSearchModel', noccaDataSearchModel);

    function noccaDataSearchModel () {

        var factory = {
            query: undefined,
            requestKey: true,
            requestUrl: true,
            proxyUrl: true,
            endpointBaseUrl: true
        };

        return factory;
    }

}());
