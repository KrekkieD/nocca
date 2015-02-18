(function() {
    'use strict';

    /* app/pages/canvas.directive.js */

    /**
     * @desc
     * @example <div nocca-pages-canvas></div>
     */
    angular
        .module('nocca.pages')
        .directive(
            'noccaPagesCanvas', CanvasDirective);

    function CanvasDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'canvas.directive.html',
            controller: CanvasDirectiveController,
            controllerAs: 'vm'
        };

        return directive;

        /* @ngInject */
        function CanvasDirectiveController() {
            // Injecting $scope just for comparison

            /* jshint validthis: true */
            // var vm = this;
        }
    }
}());
