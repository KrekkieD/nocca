(function() {
    'use strict';

    /* app/widgets/cache-repository.directive.js */

    /**
     * @desc
     * @example <div nocca-widgets-cache-repository></div>
     */
    angular
        .module('nocca.widgets')
        .directive(
            'noccaWidgetsCacheRepository', CacheRepositoryDirective);

    function CacheRepositoryDirective() {
        var directive = {
            restrict: 'EA',
            require: '^noccaPagesCaches',
            templateUrl: 'cache-repository.directive.html',
            scope: {
                endpointKey: '=',
                caches: '='
            },
            link: link,
            controller: CacheRepositoryDirectiveController,
            controllerAs: 'vm'
        };

        return directive;

        function link (scope, elem, attrs, noccaPagesCaches) {

            scope.refresh = noccaPagesCaches.refresh;
            scope.clearCacheRepositories = noccaPagesCaches.clearCacheRepositories;
            scope.clearCacheRepository = noccaPagesCaches.clearCacheRepository;

        }

        /* @ngInject */
        function CacheRepositoryDirectiveController () {

        }
    }
}());
