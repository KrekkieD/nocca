'use strict';

describe(
    'noccaPagesHttpApi (directive of nocca.pages)',
    function() {
        var $scope;
        var $el;

        beforeEach(module('nocca.pages'));

        beforeEach(inject(function($compile, $rootScope) {

            $scope = $rootScope.$new();

            var html = '<div nocca-pages-http-api>' +
                '</div>';

            $el = angular.element(html);
            $compile($el)($scope);
            $scope.$digest();
        }));
    });
