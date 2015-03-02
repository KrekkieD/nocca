'use strict';

describe(
    'noccaPagesScenarios (directive of nocca.pages)',
    function() {
        var $scope;
        var $el;

        beforeEach(module('nocca.pages'));

        beforeEach(inject(function($compile, $rootScope) {

            $scope = $rootScope.$new();

            var html = '<div nocca-pages-scenarios>' +
                '</div>';

            $el = angular.element(html);
            $compile($el)($scope);
            $scope.$digest();
        }));
    });
