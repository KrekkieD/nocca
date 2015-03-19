(function() {
    'use strict';

    /* app/pages/export.directive.js */

    /**
     * @desc
     * @example <div nocca-pages-export></div>
     */
    angular
        .module('nocca.pages')
        .directive(
            'noccaPagesExport', ExportDirective);

    function ExportDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'export.directive.html',
            controller: ExportDirectiveController
        };

        return directive;

        /* @ngInject */
        function ExportDirectiveController (
            noccaDataConnection,
            $scope
        ) {

            $scope.data = noccaDataConnection.data;

        }
    }
}());
