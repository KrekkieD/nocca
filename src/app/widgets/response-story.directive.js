(function() {
    'use strict';

    /* app/widgets/response-story.directive.js */

    /**
     * @desc
     * @example <div nocca-widgets-response-story></div>
     */
    angular
        .module('nocca.widgets')
        .directive(
            'noccaWidgetsResponseStory', ResponseStoryDirective);

    function ResponseStoryDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'response-story.directive.html',
            controller: ResponseStoryDirectiveController,
            controllerAs: 'vm'
        };

        return directive;

        /* @ngInject */
        function ResponseStoryDirectiveController() {
            // Injecting $scope just for comparison

            /* jshint validthis: true */
            // var vm = this;
        }
    }
}());
