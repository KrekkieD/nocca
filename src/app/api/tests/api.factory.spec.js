describe('noccaApi (factory of nocca.api)',
    function() {
        'use strict';

        beforeEach(module('nocca.api'));

        it('should be defined', inject(function(noccaApi) {
            expect(noccaApi)
                .toBeDefined();
        }));

    });
