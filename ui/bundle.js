/* istanbul ignore next */(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.yes = f()}})(function(){var define,module,exports;return /* istanbul ignore next */(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('./module')
    .factory('noccaApi', noccaApi);

function noccaApi ($http) {
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


},{"./module":2}],2:[function(require,module,exports){
'use strict';

module.exports = angular.module('nocca.api', [
    'ui.router'
]);

},{}],3:[function(require,module,exports){
'use strict';

require('./module')
    .factory('noccaCoreConfig', noccaCoreConfig);

function noccaCoreConfig ($http) {
    // values here

    var promise;

    var factory = {
        getConfig: getConfig
    };

    // factory functions here
    return factory;

    function getConfig () {

        if (!promise) {

            promise = $http({
                method: 'get',
                url: 'noccaConfig.json'
            }).then(function (response) {

                angular.extend(factory, response.data);
                return response.data;
            });

        }

        return promise;

    }

}

},{"./module":5}],4:[function(require,module,exports){
'use strict';

require('./module')
    .config(config);

function config (
    $mdThemingProvider,
    localStorageServiceProvider
) {

    localStorageServiceProvider
        .setPrefix('nocca');

    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('blue-grey', {
            'default': '600',
            'hue-1': '700',
            'hue-2': '800',
            'hue-3': '900'
        });


}

},{"./module":5}],5:[function(require,module,exports){
'use strict';

module.exports = angular.module('nocca.core', [
    'ui.router',
    'ngWebsocket',
    'ngMessages',
    'ngAnimate',
    'ngMaterial',
    'LocalStorageModule',
    'truncate',

    require('../navigation/module').name,
    require('../pages/module').name,
    require('../data/module').name,
    require('../widgets/module').name,
    require('../utils/module').name,
    require('../api/module').name
]);

},{"../api/module":2,"../data/module":7,"../navigation/module":13,"../pages/module":22,"../utils/module":28,"../widgets/module":30}],6:[function(require,module,exports){
'use strict';

require('./module')
    .factory('noccaDataConnection', noccaDataConnection);

function noccaDataConnection (
    $websocket,
    noccaCoreConfig,
    $rootScope
) {

    var factory = {
        lastUpdate: 0,
        data: {
            responses: {},
            endpoints: {},
            recorded: [],
            forwarded: [],
            replayed: [],
            miss: [],
            storyLog: []
        }
    };

    load();

    // factory functions here
    return factory;

    function load () {

        var websocketServerUrl = 'ws://';

        websocketServerUrl += document.location.host;
        websocketServerUrl += '';

        var ws = $websocket.$new(websocketServerUrl);

        ws.$on('$message', function (data) {

            // merge data with factory data
            Object.keys(data).forEach(function (key) {

                if (Array.isArray(data[key])) {
                    Array.prototype.push.apply(
                        factory.data[key],
                        data[key]
                    );
                }
                else if (data[key] instanceof Object) {

                    Object.keys(data[key]).forEach(function (dataKey) {

                        factory.data[key][dataKey] = data[key][dataKey];

                    });

                }

            });

            factory.lastUpdate = new Date().getTime();

            $rootScope.$apply();

        });

    }

}

},{"./module":7}],7:[function(require,module,exports){
'use strict';

module.exports = angular.module('nocca.data', []);

},{}],8:[function(require,module,exports){
'use strict';

require('./module')
    .filter('noccaDataObjectLength', noccaDataObjectLength);

function noccaDataObjectLength () {

    return function (obj) {

        var length = 0;
        if (Array.isArray(obj)) {
            length = obj.length;
        }
        else if (typeof obj === 'object') {
            length = Object.keys(obj).length;
        }
        return length;

    };

}

},{"./module":7}],9:[function(require,module,exports){
'use strict';

require('./module')
    .filter('noccaDataOrderObject', noccaDataOrderObject);

function noccaDataOrderObject () {

    return function (items, field, reverse) {

        var filtered = [];
        angular.forEach(items, function (item) {
            filtered.push(item);
        });

        filtered.sort(function (a, b) {
            return a[field] > b[field] ? 1 : -1;
        });

        if (reverse) {
            filtered.reverse();
        }

        return filtered;

    };

}

},{"./module":7}],10:[function(require,module,exports){
'use strict';

require('./module')
    .factory('noccaDataSearchModel', noccaDataSearchModel);

function noccaDataSearchModel ($mdToast) {

    var factory = {
        model: {
            query: undefined,

            // search in which objects?
            clientRequest: true,
            proxyRequest: true,
            proxyResponse: true,
            playbackResponse: true,
            clientResponse: true,

            // search on which fields?
            endpointKey: true,
            requestKey: true,
            headers: true,
            body: true,
            path: true
        },
        search: {
            active: false,
            result: undefined,
            count: undefined
        },
        toggleField: toggleField
    };

    return factory;

    function toggleField (key) {

        if (factory.model.hasOwnProperty(key)) {
            factory.model[key] = !factory.model[key];

            toast(key);
        }

    }

    function toast (key) {

        var messages = {
            clientRequest: {
                off: 'Not searching client requests',
                on: 'Searching client requests'
            },
            proxyRequest: {
                off: 'Not searching proxy requests',
                on: 'Searching proxy requests'
            },
            proxyResponse: {
                off: 'Not searching proxy responses',
                on: 'Searching proxy responses'
            },
            playbackResponse: {
                off: 'Not searching playback responses',
                on: 'Searching playback responses'
            },
            clientResponse: {
                off: 'Not searching client responses',
                on: 'Searching client responses'
            },

            // search on which fields?
            endpointKey: {
                off: 'Not searching on endpoint keys',
                on: 'Searching on endpoint keys'
            },
            requestKey: {
                off: 'Not searching on request keys',
                on: 'Searching on request keys'
            },
            headers: {
                off: 'Not searching in request headers',
                on: 'Searching in request headers'
            },
            body: {
                off: 'Not searching client responses',
                on: 'Searching client responses'
            },
            path: {
                off: 'Not searching message bodies',
                on: 'Searching message bodies'
            }
        };

        var msg = factory.model[key] ? messages[key].on : messages[key].off;

        $mdToast.show($mdToast.simple()
            .content(msg)
            .position('top right'));

    }
}

},{"./module":7}],11:[function(require,module,exports){
'use strict';

require('./module')
    .filter('noccaDataSearch', noccaDataSearch);

function noccaDataSearch (noccaDataSearchModel) {

    return filterData;

    function filterData (data) {

        var query = noccaDataSearchModel.model.query;

        if (!query) {
            noccaDataSearchModel.search.result = data;
            noccaDataSearchModel.search.count = undefined;
            noccaDataSearchModel.search.active = false;
        }
        else {

            var search = new Search(noccaDataSearchModel.model.query);

            noccaDataSearchModel.search.active = true;
            noccaDataSearchModel.search.count = 0;

            var newResponses = {};
            Object.keys(data.responses).forEach(function (requestHash) {
                var response = data.responses[requestHash];

                // transform into string with relevant data
                var matchString = search.subjectMaker(response);

                if (search.matches(matchString)) {
                    noccaDataSearchModel.search.count++;
                    newResponses[requestHash] = response;
                }

            });

            data.responses = newResponses;
            noccaDataSearchModel.search.result = data;

        }

        return noccaDataSearchModel.search.result;

    }

    function Search (query) {

        var querySplitter = /[, ]/;
        var queryParts = query.split(querySplitter);
        var iMax = queryParts.length;

        this.matches = matches;
        this.subjectMaker = subjectMaker();

        function matches (string) {

            for (var i = 0; i < iMax; i++) {
                if (string.indexOf(queryParts[i]) > -1) {
                    return true;
                }
            }

            return false;

        }

        function subjectMaker () {

            // search in which objects?
            var responseArray = ['clientRequest', 'proxyRequest', 'proxyResponse', 'playbackResponse', 'clientResponse'];
            var relevantResponseArray = [];
            responseArray.forEach(function (responseObjKey) {
                if (noccaDataSearchModel.model[responseObjKey]) {
                    relevantResponseArray.push(responseObjKey);
                }
            });

            // search in which fields?
            var fieldsArray = ['endpointKey', 'requestKey', 'headers', 'body', 'path'];
            var relevantFieldsArray = {};
            fieldsArray.forEach(function (fieldKey) {
                if (noccaDataSearchModel.model[fieldKey]) {
                    relevantFieldsArray[fieldKey] = true;
                }
            });

            return function (response) {

                // dirty way for one-off match -- add stuff to array, json stringify at the end.
                var matchString = [];

                // process active fields that are not responseObj bound
                if (typeof relevantFieldsArray.endpointKey !== 'undefined' &&
                    response.endpoint &&
                    response.endpoint.key) {

                    matchString.push(response.endpoint.key);

                }

                if (typeof relevantFieldsArray.requestKey !== 'undefined' &&
                    response.requestKey) {

                    matchString.push(response.requestKey);

                }

                relevantResponseArray.forEach(function (responseObjKey) {
                    if (response[responseObjKey]) {

                        // process active fields that are responseObj bound
                        if (typeof relevantFieldsArray.headers !== 'undefined' &&
                            response[responseObjKey].headers) {

                            matchString.push(response[responseObjKey].headers);
                        }
                        if (typeof relevantFieldsArray.body !== 'undefined' &&
                            response[responseObjKey].body) {

                            matchString.push(response[responseObjKey].body);
                        }
                        if (typeof relevantFieldsArray.path !== 'undefined' &&
                            response[responseObjKey].path) {

                            matchString.push(response[responseObjKey].path);
                        }

                    }
                });

                return JSON.stringify(matchString);

            };

        }

    }

}

},{"./module":7}],12:[function(require,module,exports){
'use strict';

require('./module')
    .filter('noccaDataUnique', noccaDataUnique);

function noccaDataUnique () {

    return function (arr, field) {

        var trackingObject = {};
        var returnArray = [];

        for (var i = 0, iMax = arr.length; i < iMax; i += 1) {

            var matchValue = arr[i];

            if (typeof arr[i] === 'object') {
                matchValue = arr[i][field];
            }

            if (typeof trackingObject[matchValue] === 'undefined') {
                returnArray.push(arr[i]);
            }

            trackingObject[matchValue] = arr[i];

        }

        return returnArray;
    };

}

},{"./module":7}],13:[function(require,module,exports){
'use strict';

module.exports = angular.module('nocca.navigation', []);

},{}],14:[function(require,module,exports){
'use strict';

require('./module')
    .config(config);

function config (
    $stateProvider,
    $urlRouterProvider,
    noccaNavigationStates
) {

    // this should be safe
    $urlRouterProvider.otherwise('/');

    // shorten var for convenience
    var states = noccaNavigationStates;

    $stateProvider
        .state(states.nocca, {
            abstract: true,
            url: '',
            template: '<nocca-pages-canvas></nocca-pages-canvas>',
            resolve: {
                config: function (noccaCoreConfig) {
                    return noccaCoreConfig.getConfig();
                }
            }
        })
        .state(states.status, {
            url: '/',
            template: '<nocca-pages-status></nocca-pages-status>'
        })
        .state(states.caches, {
            url: '/caches',
            template: '<nocca-pages-caches></nocca-pages-caches>'
        })
        .state(states.export, {
            url: '/export',
            template: '<nocca-pages-export></nocca-pages-export>'
        })
        .state(states.scenarios, {
            url: '/scenarios',
            template: '<nocca-pages-scenarios></nocca-pages-scenarios>'
        })
        .state(states.httpApi, {
            url: '/http-api',
            template: '<nocca-pages-http-api></nocca-pages-http-api>'
        })
        .state(states.configuration, {
            url: '/configuration',
            template: '<nocca-pages-configuration></nocca-pages-configuration>'
        });

}

},{"./module":13}],15:[function(require,module,exports){
'use strict';

require('./module')
    .directive(
        'noccaNavigationSideNav', SideNavDirective);

function SideNavDirective () {
    var directive = {
        restrict: 'EA',
        replace: true,
        templateUrl: 'side-nav.directive.html',
        controller: SideNavDirectiveController
    };

    return directive;

    /* @ngInject */
    function SideNavDirectiveController (
        $scope,
        $mdSidenav,
        noccaNavigationStates
    ) {

        var hideNavOnMouseLeaveEnabled = false;
        $scope.hideNavOnMouseLeave = function (enable) {

            if (enable) {
                hideNavOnMouseLeaveEnabled = true;
            }
            else {
                if (hideNavOnMouseLeaveEnabled === true) {
                    $mdSidenav('nav').close();
                }
            }

        };

        $scope.uiStates = noccaNavigationStates;

    }
}

},{"./module":13}],16:[function(require,module,exports){
'use strict';

require('./module')
    .constant(
        'noccaNavigationStates', {
            nocca: 'nocca',
            status: 'nocca.status',
            caches: 'nocca.caches',
            export: 'nocca.export',
            manage: 'nocca.manage',
            scenarios: 'nocca.scenarios',
            httpApi: 'nocca.httpApi',
            configuration: 'nocca.configuration'
        }
    );

},{"./module":13}],17:[function(require,module,exports){
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
        this.getScenarios = getScenarios;
        this.getCacheRepositories = getCacheRepositories;
        this.resetScenario = resetScenario;
        this.enableScenario = enableScenario;
        this.disableScenario = disableScenario;
        this.clearCacheRepository = clearCacheRepository;
        this.clearCacheRepositories = clearCacheRepositories;

        refresh($scope);


        function refresh () {

            // getScenarios($scope);
            // getCacheRepositories($scope);

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
                .then(function () {
                    return getScenario(scenarioKey);
                });

        }

        function enableScenario (scenarioKey) {

            return noccaApi.toggleScenarioActive(scenarioKey, true)
                .then(function () {
                    return getScenario(scenarioKey);
                });

        }

        function disableScenario (scenarioKey) {

            return noccaApi.toggleScenarioActive(scenarioKey, false)
                .then(function () {
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

},{"./module":22}],18:[function(require,module,exports){
'use strict';

require('./module')
    .directive('noccaPagesCanvas', CanvasDirective);

function CanvasDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'canvas.directive.html',
        replace: true,
        controller: CanvasDirectiveController
    };

    return directive;

    /* @ngInject */
    function CanvasDirectiveController (
        $scope,
        $mdSidenav
    ) {

        $scope.toggleNav = function () {
            $mdSidenav('nav').toggle();
        };

    }
}

},{"./module":22}],19:[function(require,module,exports){
'use strict';

require('./module')
    .directive('noccaPagesConfiguration', ConfigurationDirective);

function ConfigurationDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'configuration.directive.html',
        controller: ConfigurationDirectiveController
    };

    return directive;

    /* @ngInject */
    function ConfigurationDirectiveController ($scope, noccaCoreConfig) {

        noccaCoreConfig.getConfig().then(function (value) {
            $scope.noccaCoreConfig = value;
        });


    }
}

},{"./module":22}],20:[function(require,module,exports){
'use strict';

require('./module')
    .directive('noccaPagesExport', ExportDirective);

function ExportDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'export.directive.html',
        controller: ExportDirectiveController
    };

    return directive;

    /* @ngInject */
    function ExportDirectiveController (
        noccaDataConnection,
        $scope
    ) {

        $scope.data = noccaDataConnection.data;

    }
}

},{"./module":22}],21:[function(require,module,exports){
'use strict';

require('./module')
    .directive('noccaPagesHttpApi', HttpApiDirective);

function HttpApiDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'http-api.directive.html',
        controller: HttpApiDirectiveController
    };

    return directive;

    /* @ngInject */
    function HttpApiDirectiveController (noccaApi, $scope) {

        $scope.httpApi = [];
        $scope.httpApiHost = noccaApi.getHttpApiHost();

        noccaApi.getRoutes()
            .then(function (routes) {

                $scope.httpApi.length = 0;
                Array.prototype.push.apply($scope.httpApi, routes);

            });
    }
}

},{"./module":22}],22:[function(require,module,exports){
'use strict';

module.exports = angular.module('nocca.pages', []);

},{}],23:[function(require,module,exports){
'use strict';

require('./module')
    .config(config);

function config () {

}

},{"./module":22}],24:[function(require,module,exports){
'use strict';

require('./module')
    .directive('noccaPagesScenarios', ScenariosDirective);

function ScenariosDirective () {

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
        noccaApi
    ) {

        $scope.startRecording = startRecording;
        $scope.stopRecording = stopRecording;
        $scope.cancelRecording = cancelRecording;

        $scope.scenarioModel = {};

        refreshStatus();

        function refreshStatus () {

            $http({
                method: 'get',
                url: noccaApi.getHttpApiHost() + '/scenarios/recorder'
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

            var payload = angular.extend({}, $scope.scenarioModel);
            payload.startRecording = true;

            $http({
                method: 'put',
                url: noccaApi.getHttpApiHost() + '/scenarios/recorder',
                data: payload
            }).then(function () {

                showToastWithMessage('Recording started successfully');

                refreshStatus();
            }, function (response) {

                showToastWithMessage('Could not start recording: ' + response.data);

                refreshStatus();

            });

        }

        function stopRecording () {

            var payload = angular.extend({}, $scope.scenarioModel);
            payload.stopRecording = true;

            $http({
                method: 'put',
                url: noccaApi.getHttpApiHost() + '/scenarios/recorder',
                data: payload
            }).then(function () {

                showToastWithMessage('Recording stopped and saved');

                refreshStatus();
            }, function (response) {

                showToastWithMessage('Could not stop recording: ' + response.data);

                refreshStatus();

            });

        }

        function cancelRecording () {

            var payload = angular.extend({}, $scope.scenarioModel);
            payload.cancelRecording = true;

            $http({
                method: 'delete',
                url: noccaApi.getHttpApiHost() + '/scenarios/recorder'
            }).then(function () {

                showToastWithMessage('Recording cancelled');

                refreshStatus();
            }, function (response) {

                showToastWithMessage('Could not cancel recording: ' + response.data);

                refreshStatus();

            });

        }

    }

}

},{"./module":22}],25:[function(require,module,exports){
'use strict';

require('./module')
    .directive('noccaPagesStatus', StatusDirective);

function StatusDirective () {
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

        $scope.maxResponses = 50;

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

},{"./module":22}],26:[function(require,module,exports){
'use strict';

require('./module')
    .directive('noccaUtilsDownloadDialog', DownloadDialogDirective);

function DownloadDialogDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'download-dialog.directive.html',
        controller: DownloadDialogDirectiveController
    };

    return directive;

    /* @ngInject */
    function DownloadDialogDirectiveController (
        $scope,
        $mdDialog,
        localStorageService
    ) {

        localStorageService.bind(
            $scope,
            'download',
            {
                filename: 'caches.json'
            }
        );

        $scope.save = save;
        $scope.cancel = cancel;

        function save () {
            $mdDialog.hide(localStorageService.get('download').filename);
        }

        function cancel () {
            $mdDialog.hide(false);
        }

    }
}

},{"./module":28}],27:[function(require,module,exports){
'use strict';

require('./module')
    .factory('noccaUtilsDownload', noccaUtilsDownload);

function noccaUtilsDownload (
    $http,
    $mdDialog
) {

    var factory = {
        createPackageAndSave: createPackageAndSave,
        createPackage: createPackage,
        saveDialog: saveDialog
    };

    return factory;

    function createPackageAndSave () {

        createPackage()
            .then(saveDialog)
            .then(performSave);

    }

    function createPackage () {

        return $http({
            // TODO: host should be dynamic, probably
            url: 'http://localhost:3005/caches/package',
            method: 'post'
        }).then(function (response) {

            return {
                type: response.headers('Content-Type'),
                data: response.data
            };

        });

    }

    function saveDialog (saveData) {

        return $mdDialog.show({
            template: '<md-dialog nocca-utils-download-dialog></md-dialog>'
        })
        .then(function (filename) {

            // add filename to obj
            saveData.fileName = filename;
            return saveData;

        }, function () {
            $mdDialog.hide();
        });

    }

    function performSave (/* saveConfig */) {

        // new Blob([
        //     JSON.stringify(saveConfig.data, null, 4)
        // ], {
        //     type: saveConfig.type + ';charset=utf-8;'
        // });

    }

}

},{"./module":28}],28:[function(require,module,exports){
'use strict';

module.exports = angular.module('nocca.utils', []);

},{}],29:[function(require,module,exports){
'use strict';

require('./module')
    .directive('noccaWidgetsCacheRepository', CacheRepositoryDirective);

function CacheRepositoryDirective () {

    var directive = {
        restrict: 'EA',
        require: '^noccaPagesCaches',
        templateUrl: 'cache-repository.directive.html',
        scope: {
            endpointKey: '=',
            caches: '='
        },
        link: link,
        controller: CacheRepositoryDirectiveController,
        controllerAs: 'vm'
    };

    return directive;

    function link (scope, elem, attrs, noccaPagesCaches) {

        scope.refresh = noccaPagesCaches.refresh;
        scope.clearCacheRepositories = noccaPagesCaches.clearCacheRepositories;
        scope.clearCacheRepository = noccaPagesCaches.clearCacheRepository;

    }

    /* @ngInject */
    function CacheRepositoryDirectiveController () {

    }
}

},{"./module":30}],30:[function(require,module,exports){
'use strict';

module.exports = angular.module('nocca.widgets', []);

},{}],31:[function(require,module,exports){
'use strict';

require('./module')
    .directive('noccaWidgetsRequestDialog', RequestDialogDirective);

function RequestDialogDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'request-dialog.directive.html',
        controller: RequestDialogDirectiveController
    };

    return directive;

    /* @ngInject */
    function RequestDialogDirectiveController (
        $scope,
        $mdDialog,
        $mdMedia,
        localStorageService
    ) {

        console.log('directive', $scope.content);

        $scope.$watch(function () {
            return !$mdMedia('gt-md');
        }, function (asIcons) {
            $scope.asIcons = asIcons;
        });

        localStorageService.bind(
            $scope,
            'requestDialog',
            {
                raw: true,
                rawWrap: true,
                body: true,
                bodyWrap: true
            }
        );


        $scope.close = function () {
            $mdDialog.hide();
        };

    }

}

},{"./module":30}],32:[function(require,module,exports){
/* global vkbeautify */

'use strict';

require('./module')
    .directive('noccaWidgetsRequestPreview', RequestPreviewDirective);

function RequestPreviewDirective () {

    var directive = {
        restrict: 'EA',
        scope: {
            preview: '=',
            requestDialog: '='
        },
        templateUrl: 'request-preview.directive.html',
        link: link
    };

    return directive;

    function link (scope) {

        if (scope.preview) {

            var headers = scope.preview.headers || {};

            Object.keys(headers).forEach(function (key) {

                if (key.toLowerCase() === 'content-type') {

                    if (headers[key].indexOf('xml') > -1 ||

                        // not entirely sure if html is gonna play
                        headers[key].indexOf('html') > -1) {

                        scope.prettyBody = vkbeautify.xml(scope.preview.body);
                    }
                    else if (headers[key].indexOf('json') > -1) {
                        scope.prettyBody = vkbeautify.json(scope.preview.body);
                    }
                    else {
                        // if we can't format, at least return something
                        scope.prettyBody = scope.preview.body;
                    }

                    return false;
                }

            });

        }

    }

}

},{"./module":30}],33:[function(require,module,exports){
'use strict';

require('./module')
    .directive(
        'noccaWidgetsResponse', ResponseDirective);

function ResponseDirective () {

    var directive = {
        restrict: 'EA',
        scope: {
            response: '='
        },
        templateUrl: 'response.directive.html',
        controller: ResponseDirectiveController
    };

    return directive;

    /* @ngInject */
    function ResponseDirectiveController (
        $scope,
        $mdDialog,
        $timeout
    ) {

        var truncateLength = 170;
        var truncateTimer;
        var truncateTimeout = 400;

        $scope.truncateLength = truncateLength;
        $scope.truncateOff = truncateOff;
        $scope.truncateOn = truncateOn;

        $scope.showDialog = showDialog;


        function truncateOff () {

            truncateTimer = $timeout(function () {
                $scope.truncateLength = 'off';
            }, truncateTimeout);

        }

        function truncateOn () {

            $timeout.cancel(truncateTimer);

            truncateTimer = $timeout(function () {
                $scope.truncateLength = truncateLength;
            }, truncateTimeout);

        }

        function showDialog (e) {

            var content = $scope.response;
            $mdDialog.show({
                controller: function ($scope) {
                    $scope.content = content;
                },
                escapeToClose: true,
                clickOutsideToClose: true,
                template: '<md-dialog nocca-widgets-request-dialog class="nocca-request-dialog"></md-dialog>',
                targetEvent: e
            });

        }

    }

}

},{"./module":30}],34:[function(require,module,exports){
'use strict';

require('./module')
    .directive('noccaWidgetsScenario', ScenarioDirective);

function ScenarioDirective () {

    var directive = {
        restrict: 'EA',
        require: '^noccaPagesCaches',
        templateUrl: 'scenario.directive.html',
        scope: {
            scenario: '='
        },
        link: link,
        controller: ScenarioDirectiveController,
        controllerAs: 'vm'
    };

    return directive;

    function link (scope, elem, attrs, noccaPagesCaches) {

        scope.refresh = noccaPagesCaches.refresh;
        scope.resetScenario = noccaPagesCaches.resetScenario;
        scope.enableScenario = noccaPagesCaches.enableScenario;
        scope.disableScenario = noccaPagesCaches.disableScenario;

    }

    /* @ngInject */
    function ScenarioDirectiveController () {



    }
}

},{"./module":30}],35:[function(require,module,exports){
(function () {

    'use strict';

    angular.element(document)
        .ready(function () {
            angular.bootstrap(document.getElementById(
                'noccaCore'), [
                'nocca.core'
            ]);
        });

}());

},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35])(35)
});