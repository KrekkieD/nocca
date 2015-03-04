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
            templateUrl: 'request-preview.directive.html',
            link: link
        };

        return directive;

        function link (scope) {

            if (typeof scope.preview.body !== 'undefined') {

                var headers = scope.preview.headers || {};

                Object.keys(headers).forEach(function (key) {

                    if (key.toLowerCase() === 'content-type') {

                        if (headers[key].indexOf('xml') > -1) {
                            scope.prettyBody = vkbeautify.xml(scope.preview.body);
                        }
                        else if (headers[key].indexOf('json') > -1) {
                            scope.prettyBody = vkbeautify.json(scope.preview.body);
                        }

                        return false;
                    }

                });

            }

        }

    }
}());
