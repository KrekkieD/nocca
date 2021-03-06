'use strict';

require('./module')
    .directive('noccaUtilsDownloadDialog', DownloadDialogDirective);

function DownloadDialogDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'download-dialog.directive.html',
        controller: DownloadDialogDirectiveController
    };

    return directive;

    /* @ngInject */
    function DownloadDialogDirectiveController (
        $scope,
        $mdDialog,
        localStorageService
    ) {

        localStorageService.bind(
            $scope,
            'download',
            {
                filename: 'caches.json'
            }
        );

        $scope.save = save;
        $scope.cancel = cancel;

        function save () {
            $mdDialog.hide(localStorageService.get('download').filename);
        }

        function cancel () {
            $mdDialog.hide(false);
        }

    }
}
