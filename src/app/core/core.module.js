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
