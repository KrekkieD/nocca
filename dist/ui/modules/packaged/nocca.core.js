(function() {
    'use strict';

    angular.module('nocca.core', [
        'ui.router',
        'ngWebsocket',
        'ngMaterial',
        'LocalStorageModule',

        'nocca.navigation',
        'nocca.pages',
        'nocca.data',
        'nocca.widgets',
        'nocca.utils'
    ]);

}());

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
    
    config.$inject = ['$mdThemingProvider', 'localStorageServiceProvider'];

}());
