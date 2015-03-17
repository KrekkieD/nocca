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
            noccaUtilsDownload,
            noccaDataSearchFilter,
            noccaDataSearchModel
        ) {

            var rawData;
            $scope.data = {};

            $scope.searchModel = noccaDataSearchModel;

            $scope.filter = {
                size: 0,
                on: false,
                query: undefined
            };

            $scope.filterData = filterData;
			$scope.downloadAll = noccaUtilsDownload.createPackageAndSave;

            $scope.$watch(function () {
                return JSON.stringify(noccaDataConnection.data);
            }, function () {

                rawData = noccaDataConnection.data;

                filterData();

            });

            function filterData () {

                // perform filtering
                $scope.data = noccaDataSearchFilter(angular.extend({}, rawData));

            }

        }
    }
}());
