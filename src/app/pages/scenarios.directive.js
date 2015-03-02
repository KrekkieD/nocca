(function() {
    'use strict';

    angular
        .module('nocca.pages')
        .directive(
            'noccaPagesScenarios', ScenariosDirective);

    function ScenariosDirective() {

        var directive = {
            restrict: 'EA',
            templateUrl: 'scenarios.directive.html',
            controller: ScenariosDirectiveController
        };

        return directive;

        function ScenariosDirectiveController (
            $scope,
            $http
        ) {

            $scope.startRecording = startRecording;
            $scope.stopRecording = stopRecording;

            $scope.scenarioModel = {};

            refreshStatus();

            function refreshStatus () {

                $http({
                    method: 'get',
                    url: 'http://localhost:3005/scenarios/recorder'
                }).then(function (response) {
                    $scope.recorderStatus = response.data;
                });

            }

            function startRecording () {

                var payload = angular.extend({}, $scope.scenarioModel);
                payload.startRecording = true;

                $http({
                    method: 'put',
                    url: 'http://localhost:3005/scenarios/recorder',
                    data: payload
                }).then(function (response) {
                    $scope.recorderStatus = response.data;

                    refreshStatus();
                });

            }

            function stopRecording () {

                var payload = angular.extend({}, $scope.scenarioModel);
                payload.stopRecording = true;

                $http({
                    method: 'put',
                    url: 'http://localhost:3005/scenarios/recorder',
                    data: payload
                }).then(function (response) {
                    $scope.recorderStatus = response.data;

                    refreshStatus();
                });

            }

        }

    }
}());
