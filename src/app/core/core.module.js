(function() {
    'use strict';

    angular.module('nocca.core', [
        'ui.router',
        'ngWebsocket',
        'ngMessages',
        'ngMaterial',
        'LocalStorageModule',
        'truncate',

        'nocca.navigation',
        'nocca.pages',
        'nocca.data',
        'nocca.widgets',
        'nocca.utils'
    ]);

}());
