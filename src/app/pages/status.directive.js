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
            noccaUtilsDownload
        ) {

            var rawData;
            $scope.data = {};

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
                $scope.data = angular.extend({}, rawData);
                filterData($scope.filter.query);

            });

            function filterData (query) {

                if (!query) {
                    $scope.data = rawData;
                    $scope.filter.on = false;
                    $scope.filter.size = 0;
                }
                else {
                    $scope.filter.on = true;

                    var newResponses = {};
                    Object.keys(rawData.responses).forEach(function (requestHash) {
                        var response = rawData.responses[requestHash];

                        // dirty way for one-off match
                        var matchString = '';
                        matchString += response.requestKey;
                        matchString += response.request ? response.request.url || '' : '';
                        matchString += response.proxiedRequest ? response.proxiedRequest.url || '' : '';
                        matchString += response.endpoint && response.endpoint.definition ? response.endpoint.definition.targetBaseUrl || '' : '';

                        // match filter
                        if (matchString.indexOf(query) > -1) {

                            $scope.filter.size++;
                            newResponses[requestHash] = response;
                        }

                    });

                    $scope.data.responses = newResponses;



                }

            }

        }
    }
}());
