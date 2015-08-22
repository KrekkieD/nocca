(function() {
    'use strict';

    /* app/widgets/response-block.directive.js */

    /**
     * @desc
     * @example <div nocca-widgets-response-block></div>
     */
    angular
        .module('nocca.widgets')
        .directive(
            'noccaWidgetsResponseBlock', ResponseBlockDirective);

    function ResponseBlockDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'response-block.directive.html',
            controller: ResponseBlockDirectiveController,
            controllerAs: 'vm'
        };

        return directive;

        /* @ngInject */
        function ResponseBlockDirectiveController() {
            // Injecting $scope just for comparison

            /* jshint validthis: true */
            // var vm = this;
        }
    }
}());
