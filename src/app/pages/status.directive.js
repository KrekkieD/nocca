(function() {
    'use strict';

    /* app/pages/status.directive.js */

    /**
     * @desc
     * @example <div nocca-pages-status></div>
     */
    angular
        .module('nocca.pages')
        .directive(
            'noccaPagesStatus', StatusDirective);

    function StatusDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'status.directive.html',
            controller: StatusDirectiveController,
            controllerAs: 'vm'
        };

        return directive;

        /* @ngInject */
        function StatusDirectiveController (
            noccaDataConnection,
            $scope
        ) {

            $scope.data = noccaDataConnection.data;

            $scope.exportMocks = exportMocks;


            function exportMocks () {
                _download(JSON.stringify($scope.data.mocks, null, 4), 'nocca.json', 'application/json');
            }

            function _download (content, filename, contentType) {

                contentType = contentType || 'application/octet-stream';

                var a = document.createElement('a');
                var blob = new Blob([content], {'type': contentType});
                a.href = window.URL.createObjectURL(blob);
                a.download = filename;
                a.click();

            }
        }
    }
}());
