'use strict';

require('./module')
    .factory('noccaApi', noccaApi);

function noccaApi ($http, noccaCoreConfig) {
    // values here

    var factory = {
        getHttpApiHost: getHttpApiHost,
        getRoutes: getRoutes,

        // TODO: the following functions are less generic than assumed before, should probably be removed
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

    function getHttpApiHost () {

        var httpApiUrl = 'http://';

        httpApiUrl += document.location.host;
        httpApiUrl += '/http-api';

        return httpApiUrl;

    }

    function getRoutes () {

        return $http({
            url: getHttpApiHost() + '/routes',
            method: 'GET'
        }).then(function (response) {
            return response.data;
        });

    }

    function getScenarios () {

        return $http({
            url: getHttpApiHost() + '/scenarios',
            method: 'GET'
        }).then(function (response) {
            return response.data;
        });

    }

    function getScenario (scenarioKey) {

        return $http({
            url: getHttpApiHost() + '/scenarios/' + scenarioKey,
            method: 'GET'
        }).then(function (response) {
            return response.data;
        });

    }

    function resetScenario (scenarioKey) {

        return $http({
            url: getHttpApiHost() + '/scenarios/' + scenarioKey + '/currentPosition',
            method: 'DELETE'
        }).then(function (response) {
            return response.data;
        });

    }

    function toggleScenarioActive (scenarioKey, active) {

        return $http({
            url: getHttpApiHost() + '/scenarios/' + scenarioKey + '/active',
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
            url: getHttpApiHost() + '/repositories/memory-caches/endpoints',
            method: 'GET'
        }).then(function (response) {
            return response.data;
        });

    }

    function clearCacheRepository (endpointKey) {

        return $http({
            url: getHttpApiHost() + '/repositories/memory-caches/endpoints/' + endpointKey + '/caches',
            method: 'DELETE'
        }).then(function (response) {
            return response.data;
        });

    }

    function clearCacheRepositories () {

        return $http({
            url: getHttpApiHost() + '/repositories/memory-caches/endpoints',
            method: 'DELETE'
        }).then(function (response) {
            return response.data;
        });

    }

}

