'use strict';

require('./module')
    .directive('noccaPagesExport', ExportDirective);

function ExportDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'export.directive.html',
        controller: ExportDirectiveController
    };

    return directive;

    /* @ngInject */
    function ExportDirectiveController (
        noccaDataConnection,
        $scope
    ) {

        $scope.data = noccaDataConnection.data;

    }
}
