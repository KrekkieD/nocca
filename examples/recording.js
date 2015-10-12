'use strict';

var $nocca = require('../index');

new $nocca({
    record: true,
    endpoints: {
        _default: {
            targetBaseUrl: 'http://www.google.com'
        }
    },
    scenarios: {
        writeNewScenarios: true,
        scenarioOutputDir: '/dev/temp/nested/deeply/for/testing'
    }
});
