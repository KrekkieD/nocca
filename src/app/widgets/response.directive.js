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

            function showDialog (e, type) {

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
}());
