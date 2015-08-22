(function() {
    'use strict';

    /* app/widgets/response-slice.directive.js */

    /**
     * @desc
     * @example <div nocca-widgets-response-slice></div>
     */
    angular
        .module('nocca.widgets')
        .directive(
            'noccaWidgetsResponseSlice', ResponseSliceDirective);

    function ResponseSliceDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'response-slice.directive.html',
            controller: ResponseSliceDirectiveController,
            controllerAs: 'vm'
        };

        return directive;

        /* @ngInject */
        function ResponseSliceDirectiveController() {
            // Injecting $scope just for comparison

            /* jshint validthis: true */
            // var vm = this;
        }
    }
}());
