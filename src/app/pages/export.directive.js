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
            controller: ExportDirectiveController,
            controllerAs: 'vm'
        };

        return directive;

        /* @ngInject */
        function ExportDirectiveController() {
            // Injecting $scope just for comparison

            /* jshint validthis: true */
            // var vm = this;
        }
    }
}());
