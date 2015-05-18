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
            noccaDataSearchModel,
            $filter
        ) {

            var rawData;
            $scope.data = {};

            $scope.count = {
                responses: 0,
                endpoints: 0,
                recorded: 0,
                forwarded: 0,
                replayed: 0,
                storyLog: 0
            };

            $scope.searchModel = noccaDataSearchModel;

            $scope.filter = {
                size: 0,
                on: false,
                query: undefined
            };

            $scope.filterData = filterData;
			$scope.downloadAll = noccaUtilsDownload.createPackageAndSave;

            $scope.$watch(function () {
                return noccaDataConnection.lastUpdate;
            }, function () {

                rawData = noccaDataConnection.data;

                filterData();

            });

            function filterData () {

                // perform filtering
                $scope.data = noccaDataSearchFilter(angular.extend({}, rawData));

                // update counts
                $scope.count.responses = $filter('noccaDataObjectLength')($scope.data.responses);
                $scope.count.endpoints = $filter('noccaDataObjectLength')($scope.data.endpoints);
                $scope.count.recorded = $filter('noccaDataObjectLength')($scope.data.recorded);
                $scope.count.forwarded = $filter('noccaDataObjectLength')($scope.data.forwarded);
                $scope.count.replayed = $filter('noccaDataObjectLength')($scope.data.replayed);
                $scope.count.storyLog = $filter('noccaDataObjectLength')($scope.data.storyLog);

            }

        }
    }
}());
