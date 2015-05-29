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

    function CanvasDirective () {

        var directive = {
            restrict: 'EA',
            templateUrl: 'canvas.directive.html',
			replace: true,
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

        }
    }
}());
