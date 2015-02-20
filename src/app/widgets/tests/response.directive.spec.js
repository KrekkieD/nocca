'use strict';

describe(
    'noccaWidgetsResponse (directive of nocca.widgets)',
    function() {
        var $scope;
        var $el;

        beforeEach(module('nocca.widgets'));

        beforeEach(inject(function($compile, $rootScope) {

            $scope = $rootScope.$new();

            var html = '<div nocca-widgets-response>' +
                '</div>';

            $el = angular.element(html);
            $compile($el)($scope);
            $scope.$digest();
        }));
    });
