'use strict';

module.exports = angular.module('nocca.core', [
    'ui.router',
    'ngWebsocket',
    'ngMessages',
    'ngAnimate',
    'ngMaterial',
    'LocalStorageModule',
    'truncate',

    require('../navigation/module').name,
    require('../pages/module').name,
    require('../data/module').name,
    require('../widgets/module').name,
    require('../utils/module').name,
    require('../api/module').name
]);
