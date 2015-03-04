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
            .accentPalette('blue-grey', {
                'default': '600',
                'hue-1': '700',
                'hue-2': '800',
                'hue-3': '900'
            });


    }

}());
