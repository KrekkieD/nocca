'use strict';

require('./module')
    .directive('noccaWidgetsRequestDialog', RequestDialogDirective);

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

        console.log('directive', $scope.content);

        $scope.$watch(function () {
            return !$mdMedia('gt-md');
        }, function (asIcons) {
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


        $scope.close = function () {
            $mdDialog.hide();
        };

    }

}
