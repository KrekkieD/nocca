(function() {
    'use strict';

    /* app/pages/configuration.directive.js */

    /**
     * @desc
     * @example <div nocca-pages-configuration></div>
     */
    angular
        .module('nocca.pages')
        .directive(
            'noccaPagesConfiguration', ConfigurationDirective);

    function ConfigurationDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'configuration.directive.html',
            controller: ConfigurationDirectiveController
        };

        return directive;

        /* @ngInject */
        function ConfigurationDirectiveController ($scope, noccaCoreConfig) {

            noccaCoreConfig.getConfig().then(function (value) {
                $scope.noccaCoreConfig = value;
            });


        }
    }
}());
