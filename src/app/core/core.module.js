(function() {
    'use strict';

    angular.module('nocca.core', [
        'ui.router',
        'ngWebsocket',
        'ngMessages',
        'ngAnimate',
        'ngMaterial',
        'LocalStorageModule',
        'truncate',
		'angularStats',

        'nocca.navigation',
        'nocca.pages',
        'nocca.data',
        'nocca.widgets',
        'nocca.utils',
        'nocca.api',
		'nocca.preferences'
    ]);

}());