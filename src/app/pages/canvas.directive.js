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
			replace: true,
            templateUrl: 'canvas.directive.html',
            controller: CanvasDirectiveController
        };

        return directive;

        /* @ngInject */
        function CanvasDirectiveController (
			$scope,
			$mdSidenav
		) {

			$scope.toggleNav = function () {
				$mdSidenav('nav').toggle();
			};

            $scope.uiStates = noccaNavigationStates;

        }
    }
}());
