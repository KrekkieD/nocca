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

            $scope.showDialog = showDialog;

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
