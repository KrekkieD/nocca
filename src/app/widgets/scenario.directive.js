'use strict';

require('./module')
    .directive('noccaWidgetsScenario', ScenarioDirective);

function ScenarioDirective() {
    var directive = {
        restrict: 'EA',
        require: '^noccaPagesCaches',
        templateUrl: 'scenario.directive.html',
        scope: {
            scenario: '='
        },
        link: link,
        controller: ScenarioDirectiveController,
        controllerAs: 'vm'
    };

    return directive;

    function link (scope, elem, attrs, noccaPagesCaches) {

        scope.refresh = noccaPagesCaches.refresh;
        scope.resetScenario = noccaPagesCaches.resetScenario;
        scope.enableScenario = noccaPagesCaches.enableScenario;
        scope.disableScenario = noccaPagesCaches.disableScenario;

    }

    /* @ngInject */
    function ScenarioDirectiveController () {



    }
}
