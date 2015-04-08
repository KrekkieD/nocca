(function() {
    'use strict';

    angular.module('nocca.navigation')
        .constant(
            'noccaNavigationStates', {
				nocca: 'nocca',
                status: 'nocca.status',
                caches: 'nocca.caches',
                export: 'nocca.export',
                manage: 'nocca.manage',
                scenarios: 'nocca.scenarios'
            }
        );
}());
