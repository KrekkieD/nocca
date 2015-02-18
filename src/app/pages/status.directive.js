(function() {
    'use strict';

    /* app/pages/status.directive.js */

    /**
     * @desc
     * @example <div nocca-pages-status></div>
     */
    angular
        .module('nocca.pages')
        .directive(
            'noccaPagesStatus', StatusDirective);

    function StatusDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'status.directive.html',
            controller: StatusDirectiveController,
            controllerAs: 'vm'
        };

        return directive;

        /* @ngInject */
        function StatusDirectiveController() {
            // Injecting $scope just for comparison

            /* jshint validthis: true */
            // var vm = this;
        }
    }
}());
