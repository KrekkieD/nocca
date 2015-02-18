(function() {
    'use strict';

    angular.module('nocca.navigation')
        .config(config);

    function config (
        $stateProvider,
        $urlRouterProvider,
        noccaNavigationStates
    ) {

        // this should be safe
        $urlRouterProvider.otherwise('/');

        // shorten var for convenience
        var states = noccaNavigationStates;

        $stateProvider
            .state(states.status, {
                url: '/',
                template: '<nocca-pages-status></nocca-pages-status>'
            })
            .state(states.export, {
                url: '/export',
                template: '<nocca-pages-export></nocca-pages-export>'
            });

    }

}());
