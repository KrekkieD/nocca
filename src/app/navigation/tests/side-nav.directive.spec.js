'use strict';

describe(
    'noccaNavigationSideNav (directive of nocca.navigation)',
    function() {
        var $scope;
        var $el;

        beforeEach(module('nocca.navigation'));

        beforeEach(inject(function($compile, $rootScope) {

            $scope = $rootScope.$new();

            var html = '<div nocca-navigation-side-nav>' +
                '</div>';

            $el = angular.element(html);
            $compile($el)($scope);
            $scope.$digest();
        }));
    });
