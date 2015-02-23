describe('noccaUtilsDownload (factory of nocca.utils)',
    function() {
        'use strict';

        beforeEach(module('nocca.utils'));

        it('should be defined', inject(function(noccaUtilsDownload) {
            expect(noccaUtilsDownload)
                .toBeDefined();
        }));

    });
