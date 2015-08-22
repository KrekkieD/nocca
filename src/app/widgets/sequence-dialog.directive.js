(function() {
    'use strict';

    /* app/widgets/sequence-dialog.directive.js */

    /**
     * @desc
     * @example <div nocca-widgets-sequence-dialog></div>
     */
    angular
        .module('nocca.widgets')
        .directive(
            'noccaWidgetsSequenceDialog', SequenceDialogDirective);

    function SequenceDialogDirective() {
        var directive = {
            restrict: 'A',
            templateUrl: 'sequence-dialog.directive.html',
            controller: SequenceDialogDirectiveController
        };

        return directive;

        /* @ngInject */
        function SequenceDialogDirectiveController () {
            // Injecting $scope just for comparison

            /* jshint validthis: true */
            // var vm = this;
        }
    }
}());
