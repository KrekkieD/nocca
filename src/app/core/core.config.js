(function() {
    'use strict';

    angular.module('nocca.core')
        .config(config);

    function config (
        $mdThemingProvider,
        localStorageServiceProvider
    ) {

        localStorageServiceProvider
            .setPrefix('nocca')

        $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey')
            .accentPalette('blue');

    }

}());
