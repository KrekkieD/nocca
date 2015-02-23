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
            $scope,
            $http,
            noccaUtilsSaveAs,
            localStorageService
        ) {

            $scope.data = {};

            localStorageService.bind(
                $scope,
                'download',
                {
                    filename: 'caches.json'
                }
            );

            $scope.downloadAll = downloadAll;

            $scope.$watch(function () {
                return JSON.stringify(noccaDataConnection.data);
            }, function () {

                $scope.data = noccaDataConnection.data;

            });


            function downloadAll () {
                $http({
                    // TODO: host should be dynamic, probably
                    url: 'http://localhost:3005/caches/package',
                    method: 'post'
                }).then(function (response) {

                    var blob = new Blob([JSON.stringify(response.data, null, 4)], {type: response.headers('Content-Type')});

                    noccaUtilsSaveAs(blob, localStorageService.get('download').filename);

                });
            }

        }
    }
}());
