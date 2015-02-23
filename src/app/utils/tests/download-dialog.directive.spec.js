'use strict';

describe(
    'noccaUtilsDownloadDialog (directive of nocca.utils)',
    function() {
        var $scope;
        var $el;

        beforeEach(module('nocca.utils'));

        beforeEach(inject(function($compile, $rootScope) {

            $scope = $rootScope.$new();

            var html = '<div nocca-utils-download-dialog>' +
                '</div>';

            $el = angular.element(html);
            $compile($el)($scope);
            $scope.$digest();
        }));
    });
