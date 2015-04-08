(function() {
    'use strict';

    angular.module('nocca.api')
        .factory('noccaApi', noccaApi);

    function noccaApi ($http, noccaCoreConfig) {
        // values here

        var factory = {
            getScenario: getScenario,
            getScenarios: getScenarios,
            resetScenario: resetScenario,
            getCacheRepositories: getCacheRepositories,
            clearCacheRepository: clearCacheRepository,
            clearCacheRepositories: clearCacheRepositories,
            toggleScenarioActive: toggleScenarioActive
        };

        // factory functions here
        return factory;

        function _getHttpApiHost () {

            var httpApiUrl = 'http://';

            if (noccaCoreConfig.servers.wrapperServer.enabled) {
                httpApiUrl += noccaCoreConfig.servers.wrapperServer.wrapper.host || document.location.host;
                httpApiUrl += noccaCoreConfig.servers.httpApi.wrapper.path;
            }
            else {
                httpApiUrl += noccaCoreConfig.servers.httpApi.listen.hostname || document.location.hostname;
                httpApiUrl += ':' + noccaCoreConfig.servers.httpApi.listen.port;
            }

            return httpApiUrl;

        }

        function getScenarios () {

            return $http({
                url: _getHttpApiHost() + '/scenarios',
                method: 'GET'
            }).then(function (response) {
                return response.data;
            });

        }

        function getScenario (scenarioKey) {

            return $http({
                url: _getHttpApiHost() + '/scenarios/' + scenarioKey,
                method: 'GET'
            }).then(function (response) {
                return response.data;
            });

        }

        function resetScenario (scenarioKey) {

            return $http({
                url: _getHttpApiHost() + '/scenarios/' + scenarioKey + '/currentPosition',
                method: 'DELETE'
            }).then(function (response) {
                return response.data;
            });

        }

        function toggleScenarioActive (scenarioKey, active) {

            return $http({
                url: _getHttpApiHost() + '/scenarios/' + scenarioKey + '/active',
                method: 'PUT',
                // force as bool
                data: JSON.stringify(active ? true : false),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                return response.data;
            });

        }

        function getCacheRepositories () {

            return $http({
                url: _getHttpApiHost() + '/repositories/memory-caches/endpoints',
                method: 'GET'
            }).then(function (response) {
                return response.data;
            });

        }

        function clearCacheRepository (endpointKey) {

            return $http({
                url: _getHttpApiHost() + '/repositories/memory-caches/endpoints/' + endpointKey + '/caches',
                method: 'DELETE'
            }).then(function (response) {
                return response.data;
            });

        }

        function clearCacheRepositories () {

            return $http({
                url: _getHttpApiHost() + '/repositories/memory-caches/endpoints',
                method: 'DELETE'
            }).then(function (response) {
                return response.data;
            });

        }

    }

}());
