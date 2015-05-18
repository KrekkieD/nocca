(function() {
    'use strict';

    /* app/pages/http-api.directive.js */

    /**
     * @desc
     * @example <div nocca-pages-http-api></div>
     */
    angular
        .module('nocca.pages')
        .directive(
            'noccaPagesHttpApi', HttpApiDirective);

    function HttpApiDirective() {
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
}());
