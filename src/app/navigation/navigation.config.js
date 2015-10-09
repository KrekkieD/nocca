'use strict';

require('./module')
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
        .state(states.nocca, {
            abstract: true,
            url: '',
            template: '<nocca-pages-canvas></nocca-pages-canvas>',
            resolve: {
                config: function (noccaCoreConfig) {
                    return noccaCoreConfig.getConfig();
                }
            }
        })
        .state(states.status, {
            url: '/',
            template: '<nocca-pages-status></nocca-pages-status>'
        })
        .state(states.caches, {
            url: '/caches',
            template: '<nocca-pages-caches></nocca-pages-caches>'
        })
        .state(states.export, {
            url: '/export',
            template: '<nocca-pages-export></nocca-pages-export>'
        })
        .state(states.scenarios, {
            url: '/scenarios',
            template: '<nocca-pages-scenarios></nocca-pages-scenarios>'
        })
        .state(states.httpApi, {
            url: '/http-api',
            template: '<nocca-pages-http-api></nocca-pages-http-api>'
        })
        .state(states.configuration, {
            url: '/configuration',
            template: '<nocca-pages-configuration></nocca-pages-configuration>'
        });

}
