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

        return directive;

        /* @ngInject */
        function ResponseDirectiveController (
            $scope,
            $mdDialog
        ) {

            var truncateLength = 170;

            $scope.truncateLength = truncateLength;

            $scope.showKey = showKey;
            $scope.showDialog = showDialog;


			function showKey (ev, key) {

				$mdDialog.show({
					template: '<md-dialog><md-content><h2>Request key</h2><pre>{{ ' + key + ' | json:4 }}</pre></md-content></md-dialog>',
					targetEvent: ev
				});

			}

            function showDialog (e, type) {

                var content = $scope.response;
                $mdDialog.show({
                    controller: function ($scope) {
                        $scope.content = content;
                    },
                    template: '<md-dialog nocca-widgets-request-dialog class="nocca-request-dialog"></md-dialog>',
                    targetEvent: e
                });

            }

        }

    }
}());
