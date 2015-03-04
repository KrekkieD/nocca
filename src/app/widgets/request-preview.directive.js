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
}());
