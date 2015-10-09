'use strict';

require('./module')
    .directive(
        'noccaPagesCaches', CachesDirective);

function CachesDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'caches.directive.html',
        controller: CachesDirectiveController,
        controllerAs: 'noccaPagesCaches'
    };

    return directive;

    /* @ngInject */
    function CachesDirectiveController (noccaApi, $scope) {

        $scope.scenarios = {};
        $scope.repositories = {};

        this.refresh = refresh;
        this.resetScenario = resetScenario;
        this.enableScenario = enableScenario;
        this.disableScenario = disableScenario;
        this.clearCacheRepository = clearCacheRepository;
        this.clearCacheRepositories = clearCacheRepositories;

        refresh($scope);


        function refresh () {

            //getScenarios($scope);
            //getCacheRepositories($scope);

        }

        function getScenarios () {

            return noccaApi.getScenarios()
                .then(function (scenarios) {
                    $scope.scenarios = scenarios;
                });

        }

        function getScenario (scenarioKey) {

            return noccaApi.getScenario(scenarioKey)
                .then(function (scenario) {
                    $scope.scenarios[scenarioKey] = scenario;
                });

        }

        function resetScenario (scenarioKey) {

            return noccaApi.resetScenario(scenarioKey)
                .then(function (step) {
                    return getScenario(scenarioKey);
                });

        }

        function enableScenario (scenarioKey) {

            return noccaApi.toggleScenarioActive(scenarioKey, true)
                .then(function (activeState) {
                    return getScenario(scenarioKey);
                });

        }

        function disableScenario (scenarioKey) {

            return noccaApi.toggleScenarioActive(scenarioKey, false)
                .then(function (activeState) {
                    return getScenario(scenarioKey);
                });

        }

        function getCacheRepositories () {

            return noccaApi.getCacheRepositories()
                .then(function (repositories) {
                    $scope.repositories = repositories;
                });

        }

        function clearCacheRepository (endpointKey) {

            return noccaApi.clearCacheRepository(endpointKey)
                .then(function (repositories) {
                    $scope.repositories[endpointKey] = repositories;
                });

        }

        function clearCacheRepositories () {

            return noccaApi.clearCacheRepositories()
                .then(function (repositories) {
                    $scope.repositories = repositories;
                });

        }

    }



}
