(function() {
    'use strict';

    /* app/widgets/response-cube.directive.js */

    /**
     * @desc
     * @example <div nocca-widgets-response-cube></div>
     */
    angular
        .module('nocca.widgets')
        .directive(
            'noccaWidgetsResponseCube', ResponseCubeDirective);

    function ResponseCubeDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'response-cube.directive.html',
            controller: ResponseCubeDirectiveController,
            controllerAs: 'vm'
        };

        return directive;

        /* @ngInject */
        function ResponseCubeDirectiveController() {
            // Injecting $scope just for comparison

            /* jshint validthis: true */
            // var vm = this;
        }
    }
}());
