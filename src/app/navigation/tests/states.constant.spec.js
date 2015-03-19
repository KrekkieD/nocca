describe(
    'noccaNavigationStates (constant of nocca.navigation)',
    function() {
        'use strict';

        beforeEach(module('nocca.navigation'));

        it('should be defined', inject(function(noccaNavigationStates) {
            expect(noccaNavigationStates)
                .toBeDefined();
        }));


        it('should equal \'\'', inject(function(noccaNavigationStates) {
            expect(noccaNavigationStates)
                .toEqual('');
        }));

    });
