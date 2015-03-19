(function() {
    'use strict';

    angular.module('nocca.navigation')
        .constant(
            'noccaNavigationStates', {
                status: 'nocca-status',
                export: 'nocca-export',
                manage: 'nocca-manage',
                scenarios: 'nocca-scenarios'
            }
        );
}());
