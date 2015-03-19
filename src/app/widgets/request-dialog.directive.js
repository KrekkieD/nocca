(function() {
    'use strict';

    /* app/widgets/request-dialog.directive.js */

    /**
     * @desc
     * @example <div nocca-widgets-request-dialog></div>
     */
    angular
        .module('nocca.widgets')
        .directive(
            'noccaWidgetsRequestDialog', RequestDialogDirective);

    function RequestDialogDirective () {

        var directive = {
            restrict: 'EA',
            templateUrl: 'request-dialog.directive.html',
            controller: RequestDialogDirectiveController
        };

        return directive;

        /* @ngInject */
        function RequestDialogDirectiveController (
            $scope,
            $mdDialog,
            $mdMedia,
            localStorageService
        ) {

            $scope.$watch(function() {
                return !$mdMedia('gt-md');
            }, function(asIcons) {
                $scope.asIcons = asIcons;
            });

            localStorageService.bind(
                $scope,
                'requestDialog',
                {
                    raw: true,
                    rawWrap: true,
                    body: true,
                    bodyWrap: true
                }
            );


            $scope.close = function() {
                $mdDialog.hide();
            };

        }

    }
}());
