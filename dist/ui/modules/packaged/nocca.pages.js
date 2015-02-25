(function() {
    'use strict';

    angular.module('nocca.pages', []);

}());

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

        
        StatusDirectiveController.$inject = ['noccaDataConnection', '$scope', 'noccaUtilsDownload'];
        return directive;

        /* @ngInject */
        function StatusDirectiveController (
            noccaDataConnection,
            $scope,
            noccaUtilsDownload
        ) {

            $scope.data = {};

			$scope.downloadAll = noccaUtilsDownload.createPackageAndSave;

            $scope.$watch(function () {
                return JSON.stringify(noccaDataConnection.data);
            }, function () {

                $scope.data = noccaDataConnection.data;

            });

        }
    }
}());

angular.module("nocca.pages").run(['$templateCache', function($templateCache) {$templateCache.put("canvas.directive.html","<div ng-cloak=\"\" layout=\"row\" class=\"nocca-full-height\"> <md-sidenav class=\"md-sidenav-left md-whiteframe-z1\" md-component-id=\"nav\"> <md-toolbar> <md-button ng-click=\"toggleNav()\" layout=\"row\" layout-align=\"center center\"> <h1 class=\"md-toolbar-tools\"> <span class=\"fa fa-chevron-left\" style=\"margin-right: 1em;\"></span> Nav </h1>  </md-button> </md-toolbar> <md-content class=\"md-padding\"> <md-list> <md-list-item layout=\"column\"> <md-item-content> <div class=\"md-tile-content\"> <h3>Status</h3> <p> Received requests, responses, recordings, etc </p> <p layout=\"column\"> <a ui-sref=\"{{ uiStates.status }}\" class=\"nocca-nav-link\"> View status <span class=\"fa fa-angle-right\"></span> </a> </p> </div> </md-item-content> <md-divider></md-divider> </md-list-item> <md-list-item layout=\"column\"> <md-item-content> <div class=\"md-tile-content\"> <h3>Manage caches</h3> <p> Import caches, export caches, yadayada </p> <p layout=\"column\"> <a ui-sref=\"{{ uiStates.status }}\" class=\"nocca-nav-link\"> Manage caches <span class=\"fa fa-angle-right\"></span> </a> </p> </div> </md-item-content> <md-divider></md-divider> </md-list-item> </md-list> </md-content> </md-sidenav> <md-content flex=\"\"> <md-toolbar layout=\"row\"> <h1 class=\"md-toolbar-tools\" flex=\"\"> You are looking at the Nocca interface </h1> </md-toolbar> <md-content class=\"md-padding\" flex=\"100\"></md-content> <md-button class=\"md-raised md-primary\" ng-click=\"toggleNav()\"> <span class=\"fa fa-cogs\"></span> <span class=\"fa fa-chevron-right\"></span> </md-button> <ui-view></ui-view> </md-content> </div>");
$templateCache.put("export.directive.html","<md-content class=\"md-padding\"> <h2>Export</h2> <md-list> <md-item layout=\"row\"> <div flex=\"15\"> Save as JSON </div> <div> Yada </div> </md-item> </md-list> </md-content>");
$templateCache.put("status.directive.html","<div> <md-content class=\"md-padding\"> <h2 flex=\"\">Status</h2> <md-tabs md-selected=\"selectedTabIndex\" flex=\"\"> <md-tab label=\"All responses ({{ data.responses | noccaDataObjectLength }})\"> <md-content class=\"md-spacing\"> <md-list> <md-list-item ng-repeat=\"(hash, response) in data.responses track by hash\"> <nocca-widgets-response response=\"response\"></nocca-widgets-response> <md-divider></md-divider> </md-list-item> </md-list> </md-content> </md-tab> <md-tab label=\"By Endpoints ({{ data.endpoints | noccaDataObjectLength }})\" ng-disabled=\"!data.endpoints\"> <md-content> <section ng-repeat=\"(endpoint, hashKeys) in data.endpoints track by endpoint\"> <md-subheader class=\"md-primary\">{{ endpoint }}</md-subheader> <md-list> <md-item ng-repeat=\"hashKey in hashKeys | noccaDataUnique\"> <nocca-widgets-response response=\"data.responses[hashKey]\"></nocca-widgets-response> <md-divider></md-divider> </md-item> </md-list> </section> </md-content> </md-tab> <md-tab label=\"Recorded ({{ data.recorded.length }})\" ng-disabled=\"!data.recorded.length\"> <md-content> <section> <md-list> <md-item ng-repeat=\"hashKey in data.recorded track by $index\"> <nocca-widgets-response response=\"data.responses[hashKey]\"></nocca-widgets-response> <md-divider></md-divider> </md-item> </md-list> </section> </md-content> </md-tab> <md-tab label=\"Forwarded ({{ data.forwarded.length }})\" ng-disabled=\"!data.forwarded.length\"> <md-content ng-show=\"data.forwarded.length\"> <section> <md-list> <md-item ng-repeat=\"hashKey in data.forwarded track by $index\"> <nocca-widgets-response response=\"data.responses[hashKey]\"></nocca-widgets-response> <md-divider></md-divider> </md-item> </md-list> </section> </md-content> </md-tab> <md-tab label=\"Replayed ({{ data.replayed.length }})\" ng-disabled=\"!data.replayed.length\"> <md-content> <section> <md-list> <md-item ng-repeat=\"hashKey in data.replayed track by $index\"> <nocca-widgets-response response=\"data.responses[hashKey]\"></nocca-widgets-response> <md-divider></md-divider> </md-item> </md-list> </section> </md-content> </md-tab> </md-tabs> <md-content layout=\"row\" class=\"md-padding\"> <md-button ng-click=\"downloadAll()\" ng-disabled=\"!data.recorded.length\"> <span class=\"fa fa-cloud-download\"></span> Download recorded ({{ data.recorded.length }}) </md-button> <span flex=\"\"></span> <md-button ng-click=\"showRaw = !showRaw\"> <span class=\"fa\" ng-class=\"{\'fa-eye\': showRaw, \'fa-eye-slash\': !showRaw}\"></span> raw data </md-button> </md-content> <pre ng-show=\"showRaw\">{{ data | json:4 }}</pre> </md-content> </div>");}]);
(function() {
    'use strict';

    angular.module('nocca.pages')
        .config(config);

    function config() {

    }

}());

(function() {
    'use strict';

    /* app/pages/export.directive.js */

    /**
     * @desc
     * @example <div nocca-pages-export></div>
     */
    angular
        .module('nocca.pages')
        .directive(
            'noccaPagesExport', ExportDirective);

    function ExportDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'export.directive.html',
            controller: ExportDirectiveController
        };

        
        ExportDirectiveController.$inject = ['noccaDataConnection', '$scope'];
        return directive;

        /* @ngInject */
        function ExportDirectiveController (
            noccaDataConnection,
            $scope
        ) {

            $scope.data = noccaDataConnection.data;

        }
    }
}());

(function() {
    'use strict';

    /* app/pages/canvas.directive.js */

    /**
     * @desc
     * @example <div nocca-pages-canvas></div>
     */
    angular
        .module('nocca.pages')
        .directive(
            'noccaPagesCanvas', CanvasDirective);

    function CanvasDirective (
        noccaNavigationStates
    ) {

        var directive = {
            restrict: 'EA',
			replace: true,
            templateUrl: 'canvas.directive.html',
            controller: CanvasDirectiveController
        };

        
        CanvasDirectiveController.$inject = ['$scope', '$mdSidenav'];
        return directive;

        /* @ngInject */
        function CanvasDirectiveController (
			$scope,
			$mdSidenav
		) {

			$scope.toggleNav = function () {
				$mdSidenav('nav').toggle();
			};

            $scope.uiStates = noccaNavigationStates;

        }
    }
    
    CanvasDirective.$inject = ['noccaNavigationStates'];
}());
