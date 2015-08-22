(function () {
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
        function StatusDirectiveController(noccaDataConnection,
                                           $scope,
                                           noccaUtilsDownload,
                                           noccaDataSearchFilter,
                                           noccaDataSearchModel,
                                           $filter,
                                           $mdDialog) {

            var rawData;
            $scope.data = {};

            $scope.showDialog = showDialog;

            $scope.setDisplayMode = setDisplayMode;
            $scope.selectedDisplayMode = 'th-list';
            $scope.displayModes = [
                'th-list',
                'list',
                'th-large',
                'th',
                'comment'
            ];

            $scope.setGroupingMode = setGroupingMode;
            $scope.selectedGroupingMode = false;
            $scope.groupingModes = [
                'server',
                'key'
            ];

            $scope.setSequenceFilter = setSequenceFilter;
            $scope.selectedSequenceFilters = [];
            $scope.sequenceFilters = [
                'play',
                'circle',
                'sign-out',
                'question'
            ];


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

            $scope.maxResponses = 50;

            $scope.filterData = filterData;
            $scope.downloadAll = noccaUtilsDownload.createPackageAndSave;

            $scope.$watch(function () {
                return noccaDataConnection.lastUpdate;
            }, function () {

                rawData = noccaDataConnection.data;

                filterData();

            });


            function showDialog(e, sequence) {

                $mdDialog.show({
                    controller: function ($scope) {
                        $scope.sequence = sequence;
                    },
                    escapeToClose: true,
                    clickOutsideToClose: true,
                    template: '<md-dialog nocca-widgets-sequence-dialog></md-dialog>',
                    targetEvent: e
                });

            }

            function setDisplayMode(mode) {
                $scope.selectedDisplayMode = mode;

                filterData();
            }

            function setGroupingMode(mode) {
                if ($scope.selectedGroupingMode === mode) {
                    $scope.selectedGroupingMode = false;
                }
                else {
                    $scope.selectedGroupingMode = mode;
                }

                filterData();
            }

            function setSequenceFilter(filter) {
                if ($scope.selectedSequenceFilters.indexOf(filter) > -1) {
                    $scope.selectedSequenceFilters.splice($scope.selectedSequenceFilters.indexOf(filter), 1);
                }
                else {
                    $scope.selectedSequenceFilters.push(filter);
                }

                filterData();
            }

            function filterData() {

                // perform filtering (todo: broken with new format)
                //$scope.data = noccaDataSearchFilter(angular.extend({}, rawData));

                var srcData = angular.extend({}, rawData);
                $scope.srcData = srcData;

                var data = [];

                if (typeof srcData.sequences !== 'undefined') {

                    // parse resulting data according to desired view
                    if ($scope.selectedGroupingMode !== false) {

                        // parse groups
                        var groups;
                        if ($scope.selectedGroupingMode === 'server') {

                            groups = srcData.endpoints;

                        }
                        else if ($scope.selectedGroupingMode === 'key') {

                            groups = srcData.requestKeys;

                        }
                        else {
                            // ehhh dawut

                        }

                        // parse groups

                        data = [];

                        Object.keys(groups).forEach(function (groupName) {

                            var group = {
                                name: groupName,
                                sequences: []
                            };

                            groups[groupName].forEach(function (sequenceId) {
                                group.sequences.push(srcData.sequences[sequenceId]);
                            });

                            data.push(group);

                        });

                    }
                    else {
                        // group is non-existent, simply wrap in a fictional big-ass group

                        var group = {
                            name: undefined,
                            sequences: []
                        };

                        Object.keys(srcData.sequences).forEach(function (sequenceId) {
                            group.sequences.push(srcData.sequences[sequenceId]);
                        });

                        data.push(group);

                        //console.log(Object.keys(srcData));
                        //console.log($scope.data);

                    }

                }


                // assign to scope
                $scope.data = data;

                // update counts
                //$scope.count.responses = $filter('noccaDataObjectLength')($scope.data.responses);
                //$scope.count.endpoints = $filter('noccaDataObjectLength')($scope.data.endpoints);
                //$scope.count.recorded = $filter('noccaDataObjectLength')($scope.data.recorded);
                //$scope.count.forwarded = $filter('noccaDataObjectLength')($scope.data.forwarded);
                //$scope.count.replayed = $filter('noccaDataObjectLength')($scope.data.replayed);
                //$scope.count.storyLog = $filter('noccaDataObjectLength')($scope.data.storyLog);

            }

        }
    }
}());
