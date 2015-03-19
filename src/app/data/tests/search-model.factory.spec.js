describe('noccaDataSearchModel (factory of nocca.data)',
    function() {
        'use strict';

        beforeEach(module('nocca.data'));

        it('should be defined', inject(function(noccaDataSearchModel) {
            expect(noccaDataSearchModel)
                .toBeDefined();
        }));

    });
