(function() {
    'use strict';

    /* app/navigation/side-nav.directive.js */

    /**
     * @desc
     * @example <div nocca-navigation-side-nav></div>
     */
    angular
        .module('nocca.navigation')
        .directive(
            'noccaNavigationSideNav', SideNavDirective);

    function SideNavDirective() {
        var directive = {
            restrict: 'EA',
            replace: true,
            templateUrl: 'side-nav.directive.html',
            controller: SideNavDirectiveController
        };

        return directive;

        /* @ngInject */
        function SideNavDirectiveController (
            $scope,
            $mdSidenav,
            noccaNavigationStates
        ) {

            var hideNavOnMouseLeaveEnabled = false;
            $scope.hideNavOnMouseLeave = function (enable) {

                if (enable) {
                    hideNavOnMouseLeaveEnabled = true;
                }
                else {
                    if (hideNavOnMouseLeaveEnabled === true) {
                        $mdSidenav('nav').close();
                    }
                }

            };

            $scope.uiStates = noccaNavigationStates;

        }
    }
}());
