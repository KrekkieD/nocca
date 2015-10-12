'use strict';

require('./module')
    .directive('noccaPagesConfiguration', ConfigurationDirective);

function ConfigurationDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'configuration.directive.html',
        controller: ConfigurationDirectiveController
    };

    return directive;

    /* @ngInject */
    function ConfigurationDirectiveController ($scope, noccaCoreConfig) {

        noccaCoreConfig.getConfig().then(function (value) {
            $scope.noccaCoreConfig = value;
        });


    }
}
