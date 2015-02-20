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
