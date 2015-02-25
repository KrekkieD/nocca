(function() {
    'use strict';

    angular.module('nocca.widgets', []);

}());

angular.module("nocca.widgets").run(['$templateCache', function($templateCache) {$templateCache.put("request-dialog.directive.html","<md-content layout=\"column\"> <md-tabs md-selected=\"selectedIndex\" flex=\"\" layout-fill=\"\"> <md-tab label=\"Request\"> <nocca-widgets-request-preview preview=\"content.request\" request-dialog=\"requestDialog\"> </nocca-widgets-request-preview> </md-tab> <md-tab label=\"Proxied Request\"> <nocca-widgets-request-preview preview=\"content.proxiedRequest\" request-dialog=\"requestDialog\"> </nocca-widgets-request-preview> </md-tab> <md-tab label=\"Response\"> <nocca-widgets-request-preview preview=\"content.response\" request-dialog=\"requestDialog\"> </nocca-widgets-request-preview> </md-tab> </md-tabs> <md-content class=\"md-padding\"> <md-divider></md-divider> <div layout=\"row\"> <md-switch ng-model=\"requestDialog.raw\" aria-label=\"Switch 1\"> <span class=\"fa fa-search-plus\"></span> raw </md-switch> <md-switch ng-model=\"requestDialog.body\" aria-label=\"Switch 1\"> <span class=\"fa fa-user\"></span> body </md-switch> <span flex=\"\"></span> <md-button ng-click=\"close()\" class=\"md-primary\"> close </md-button> </div> </md-content> </md-content> ");
$templateCache.put("request-preview.directive.html","<div> <md-item-content class=\"md-padding\"> <div class=\"md-tile-left\"> raw <span class=\"fa\" ng-class=\"{\'fa-eye\': requestDialog.raw, \'fa-eye-slash\': !requestDialog.raw}\"></span> <md-switch ng-model=\"requestDialog.rawWrap\" aria-label=\"Switch 1\"> wrap </md-switch> </div> <div class=\"md-tile-content\"> <md-content class=\"md-padding\"> <pre ng-show=\"requestDialog.raw\" ng-class=\"{\'nocca-request-preview-wrap\': requestDialog.rawWrap}\">{{ preview | json:4 }}</pre> </md-content> </div> </md-item-content> <md-divider></md-divider> <md-item-content class=\"md-padding\"> <div class=\"md-tile-left\"> body <span class=\"fa\" ng-class=\"{\'fa-eye\': requestDialog.body, \'fa-eye-slash\': !requestDialog.body}\"></span><br> <md-switch ng-model=\"requestDialog.bodyWrap\" aria-label=\"Switch 1\"> wrap </md-switch> </div> <div class=\"md-tile-content\"> <md-content class=\"md-padding\"> <em ng-show=\"!preview.body\">No body to show</em> <pre ng-show=\"preview.body && requestDialog.body\" ng-class=\"{\'nocca-request-preview-wrap\': requestDialog.bodyWrap}\">{{ preview.body }}</pre> </md-content> </div> </md-item-content> </div>");
$templateCache.put("response.directive.html","<md-item-content> <div class=\"md-tile-left response-tile-left\"> {{ response.response.statusCode}} <br> {{ response.request.method }} <br> </div> <div class=\"md-tile-content\"> <h3> {{ response.hash }} </h3> <p> <span> <md-tooltip>incoming request</md-tooltip> <span class=\"fa fa-sign-in\"></span> {{ response.request.method }} {{ response.request.url }} </span> </p> <p ng-show=\"response.proxiedRequest\"> <span> <md-tooltip>forwarded request</md-tooltip> <span class=\"fa fa-sign-out\"></span> {{ response.proxiedRequest.method }} {{ response.proxiedRequest.protocol + \'//\' + response.proxiedRequest.host + response.proxiedRequest.path }} </span> </p>    <p> <md-button ng-click=\"showDialog($event)\"> View bodies </md-button> </p> </div> </md-item-content>");}]);
(function() {
    'use strict';

    /* app/widgets/response.directive.js */

    /**
     * @desc
     * @example <div nocca-widgets-response></div>
     */
    angular
        .module('nocca.widgets')
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

        
        ResponseDirectiveController.$inject = ['$scope', '$mdDialog'];
        return directive;

        /* @ngInject */
        function ResponseDirectiveController (
            $scope,
            $mdDialog
        ) {

            $scope.showDialog = showDialog;

            function showDialog (e, type) {

                var content = $scope.response;
                $mdDialog.show({
                    controller: ['$scope', function ($scope) {
                        $scope.content = content;
                    }],
                    template: '<md-dialog nocca-widgets-request-dialog class="nocca-request-dialog"></md-dialog>',
                    targetEvent: e
                });

            }

        }

    }
}());

(function() {
    'use strict';

    /* app/widgets/request-preview.directive.js */

    /**
     * @desc
     * @example <div nocca-widgets-request-preview></div>
     */
    angular
        .module('nocca.widgets')
        .directive(
            'noccaWidgetsRequestPreview', RequestPreviewDirective);

    function RequestPreviewDirective() {
        var directive = {
            restrict: 'EA',
            scope: {
                preview: '=',
                requestDialog: '='
            },
            templateUrl: 'request-preview.directive.html'
        };

        return directive;

    }
}());

(function() {
    'use strict';

    /* app/widgets/request-dialog.directive.js */

    /**
     * @desc
     * @example <div nocca-widgets-request-dialog></div>
     */
    angular
        .module('nocca.widgets')
        .directive(
            'noccaWidgetsRequestDialog', RequestDialogDirective);

    function RequestDialogDirective () {

        var directive = {
            restrict: 'EA',
            templateUrl: 'request-dialog.directive.html',
            controller: RequestDialogDirectiveController
        };

        
        RequestDialogDirectiveController.$inject = ['$scope', '$mdDialog', 'localStorageService'];
        return directive;

        /* @ngInject */
        function RequestDialogDirectiveController (
            $scope,
            $mdDialog,
            localStorageService
        ) {

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


            $scope.close = function() {
                $mdDialog.hide();
            };

        }

    }
}());
