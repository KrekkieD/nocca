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

            $scope.data = {};

            $scope.exportMocks = exportMocks;

            $scope.$watch(function () {
                return JSON.stringify(noccaDataConnection.data);
            }, function () {

                // reparse source data to usable format
                $scope.data = noccaDataConnection.data;

                // target?:
                /*
                {
                    cacheKey: {
                        mocksServed: sum of hits
                        mocksCreated: sum of mocks created
                        mocks: {
                            requestKey: mock,
                            requestKey: mock
                        }
                    }
                }
                 */

            });


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
