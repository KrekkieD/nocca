describe('noccaDataOptions (value of nocca.data)',
    function() {
        'use strict';

        beforeEach(module('nocca.data'));

        it('should be defined', inject(function(noccaDataOptions) {
            expect(noccaDataOptions)
                .toBeDefined();
        }));


        it('should equal \'\'', inject(function(noccaDataOptions) {
            expect(noccaDataOptions)
                .toEqual('');
        }));

    });
