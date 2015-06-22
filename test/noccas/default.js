'use strict';

var $upTheTree = require('up-the-tree');

var rootTwig = $upTheTree('package.json', { twig: true });

var $nocca = rootTwig.require('.');

module.exports = createNocca;

function createNocca () {

    return new $nocca({
        record: true,
        keyGenerator: ['cherryPickingKeygen', {
            properties: ['path', 'method'],
            url: ['pathname'],
            headers: ['accept', 'content-type']
        }],
        servers: {
            wrapperServer: {
                listen: {
                    hostname: false,
                    port: process.env.VCAP_APP_PORT || 8989
                }
            },
            gui: {
                listen: false
            },
            proxy: {
                listen: false
            },
            httpApi: {
                listen: false
            }
        },
        endpoints: {
            '/plugins/simple-message-transformer/diff': {
                targetBaseUrl: 'http://localhost:8888/',
                httpMessageTransformations: {
                    CLIENT_RESPONSE: [
                        'simpleMessageTransformer',
                        [
                            {
                                search: {
                                    subject: 'body',
                                    type: 'regex',
                                    value: ['\\"[a-z]+Timestamp\\"\\s*:\\s*\"(\\d+)\"', 'g']
                                },
                                replace: {
                                    type: 'momentjs',
                                    options: {
                                        source: {
                                            format: 'x'
                                        },
                                        diff: {

                                        },
                                        format: 'x'
                                    }
                                }
                            }
                        ]
                    ]
                }
            },
            '/plugins/simple-message-transformer': {
                targetBaseUrl: 'http://localhost:8888/',
                httpMessageTransformations: {
                    CLIENT_RESPONSE: [
                        'simpleMessageTransformer',
                        [
                            {
                                search: {
                                    subject: 'body',
                                    type: 'regex',
                                    value: ['<addtimestamp>(\\d+)</addtimestamp>']
                                },
                                replace: {
                                    type: 'momentjs',
                                    options: {
                                        source: {
                                            value: ''
                                        },
                                        add: {
                                            days: 1
                                        },
                                        format: 'x'
                                    }
                                }
                            },
                            {
                                search: {
                                    subject: 'body',
                                    type: 'regex',
                                    value: ['<subtracttimestamp>(\\d+)</subtracttimestamp>']
                                },
                                replace: {
                                    type: 'momentjs',
                                    options: {
                                        source: {
                                            value: ''
                                        },
                                        subtract: {
                                            days: 1
                                        },
                                        format: 'x'
                                    }
                                }
                            }
                        ]
                    ]
                }
            }
        }
    });

}
