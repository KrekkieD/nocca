describe('noccaDataConnection (factory of nocca.data)',
    function() {
        'use strict';

        beforeEach(module('nocca.data'));

        it('should be defined', inject(function(noccaDataConnection) {
            expect(noccaDataConnection)
                .toBeDefined();
        }));

    });
