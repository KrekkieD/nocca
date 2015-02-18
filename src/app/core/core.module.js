(function() {
    'use strict';

    angular.module('nocca.core', [
        'ui.router',
        'ngWebsocket',
        'ngMaterial',

        'nocca.navigation',
        'nocca.pages',
        'nocca.data'
    ]);

}());
