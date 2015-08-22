(function() {
    'use strict';

    /* app/widgets/response-bar.directive.js */

    /**
     * @desc
     * @example <div nocca-widgets-response-bar></div>
     */
    angular
        .module('nocca.widgets')
        .directive(
            'noccaWidgetsResponseBar', ResponseBarDirective);

    function ResponseBarDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'response-bar.directive.html',
            controller: ResponseBarDirectiveController,
            controllerAs: 'vm'
        };

        return directive;

        /* @ngInject */
        function ResponseBarDirectiveController() {
            // Injecting $scope just for comparison

            /* jshint validthis: true */
            // var vm = this;
        }
    }
}());
