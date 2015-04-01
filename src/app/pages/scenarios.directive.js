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

        /* @ngInject */
        function ScenariosDirectiveController (
            $scope,
            $http,
            $mdToast,
			noccaCoreConfig
        ) {

            $scope.startRecording = startRecording;
            $scope.stopRecording = stopRecording;
            $scope.cancelRecording = cancelRecording;

            $scope.scenarioModel = {};

            refreshStatus();

            function refreshStatus () {

				var httpApiUrl = 'http://';
				httpApiUrl += noccaCoreConfig.servers.httpApi.listen.host;
				httpApiUrl += ':' + noccaCoreConfig.servers.httpApi.listen.port;
				httpApiUrl += noccaCoreConfig.servers.httpApi.contextRoot;

				$http({
					method: 'get',
					url: httpApiUrl + '/scenarios/recorder'
				}).then(function (response) {
					$scope.recorder = response.data;
				}, function () {
					$scope.recorder = undefined;
				});

            }

            function showToastWithMessage (msg) {

                $mdToast.show($mdToast.simple()
                    .content(msg)
                    .position('top right'));

            }

            function startRecording () {

				var httpApiUrl = 'http://';
				httpApiUrl += noccaCoreConfig.servers.httpApi.listen.host;
				httpApiUrl += ':' + noccaCoreConfig.servers.httpApi.listen.port;
				httpApiUrl += noccaCoreConfig.servers.httpApi.contextRoot;

				var payload = angular.extend({}, $scope.scenarioModel);
				payload.startRecording = true;

				$http({
					method: 'put',
					url: httpApiUrl + '/scenarios/recorder',
					data: payload
				}).then(function (response) {

					showToastWithMessage('Recording started successfully');

					refreshStatus();
				}, function (response) {

					showToastWithMessage('Could not start recording: ' + response.data);

					refreshStatus();

				});

            }

            function stopRecording () {

				var httpApiUrl = 'http://';
				httpApiUrl += noccaCoreConfig.servers.httpApi.listen.host;
				httpApiUrl += ':' + noccaCoreConfig.servers.httpApi.listen.port;
				httpApiUrl += noccaCoreConfig.servers.httpApi.contextRoot;


				var payload = angular.extend({}, $scope.scenarioModel);
				payload.stopRecording = true;

				$http({
					method: 'put',
					url: httpApiUrl + '/scenarios/recorder',
					data: payload
				}).then(function (response) {

					showToastWithMessage('Recording stopped and saved');

					refreshStatus();
				}, function (response) {

					showToastWithMessage('Could not stop recording: ' + response.data);

					refreshStatus();

				});

            }

            function cancelRecording () {

				var httpApiUrl = 'http://';
				httpApiUrl += noccaCoreConfig.servers.httpApi.listen.host;
				httpApiUrl += ':' + noccaCoreConfig.servers.httpApi.listen.port;
				httpApiUrl += noccaCoreConfig.servers.httpApi.contextRoot;


				var payload = angular.extend({}, $scope.scenarioModel);
				payload.cancelRecording = true;

				$http({
					method: 'delete',
					url: httpApiUrl + '/scenarios/recorder',
					data: payload
				}).then(function (response) {

					showToastWithMessage('Recording cancelled');

					refreshStatus();
				}, function (response) {

					showToastWithMessage('Could not cancel recording: ' + response.data);

					refreshStatus();

				});

            }

        }

    }
}());
