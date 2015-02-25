(function() {
    'use strict';

    angular.module('nocca.navigation', []);

}());

(function() {
    'use strict';

    angular.module('nocca.navigation')
        .constant(
            'noccaNavigationStates', {
                status: 'nocca-status',
                export: 'nocca-export',
                manage: 'nocca-manage'
            }
        );
}());

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
    
    config.$inject = ['$stateProvider', '$urlRouterProvider', 'noccaNavigationStates'];

}());
