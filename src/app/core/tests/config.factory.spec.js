describe('noccaCoreConfig (factory of nocca.core)',
    function() {
        'use strict';

        beforeEach(module('nocca.core'));

        it('should be defined', inject(function(noccaCoreConfig) {
            expect(noccaCoreConfig)
                .toBeDefined();
        }));

    });
