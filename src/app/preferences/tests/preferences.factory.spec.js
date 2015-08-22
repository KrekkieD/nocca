describe('noccaPreferences (factory of nocca.preferences)',
    function() {
        'use strict';

        beforeEach(module('nocca.preferences'));

        it('should be defined', inject(function(noccaPreferences) {
            expect(noccaPreferences)
                .toBeDefined();
        }));

    });
