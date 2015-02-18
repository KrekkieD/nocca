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

    function CanvasDirective (
        noccaNavigationStates
    ) {

        var directive = {
            restrict: 'EA',
            templateUrl: 'canvas.directive.html',
            controller: CanvasDirectiveController
        };

        return directive;

        /* @ngInject */
        function CanvasDirectiveController ($scope) {

            $scope.uiStates = noccaNavigationStates;

        }
    }
}());
