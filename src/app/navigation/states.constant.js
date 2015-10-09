'use strict';

require('./module')
    .constant(
        'noccaNavigationStates', {
            nocca: 'nocca',
            status: 'nocca.status',
            caches: 'nocca.caches',
            export: 'nocca.export',
            manage: 'nocca.manage',
            scenarios: 'nocca.scenarios',
            httpApi: 'nocca.httpApi',
            configuration: 'nocca.configuration'
        }
    );
