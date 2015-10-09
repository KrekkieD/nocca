'use strict';

require('./module')
    .factory('noccaDataSearchModel', noccaDataSearchModel);

function noccaDataSearchModel ($mdToast) {

    var factory = {
        model: {
            query: undefined,

            // search in which objects?
            clientRequest: true,
            proxyRequest: true,
            proxyResponse: true,
            playbackResponse: true,
            clientResponse: true,

            // search on which fields?
            endpointKey: true,
            requestKey: true,
            headers: true,
            body: true,
            path: true
        },
        search: {
            active: false,
            result: undefined,
            count: undefined
        },
        toggleField: toggleField
    };

    return factory;

    function toggleField (key) {

        if (factory.model.hasOwnProperty(key)) {
            factory.model[key] = !factory.model[key];

            toast(key);
        }

    }

    function toast (key) {

        var messages = {
            clientRequest: {
                off: 'Not searching client requests',
                on: 'Searching client requests'
            },
            proxyRequest: {
                off: 'Not searching proxy requests',
                on: 'Searching proxy requests'
            },
            proxyResponse: {
                off: 'Not searching proxy responses',
                on: 'Searching proxy responses'
            },
            playbackResponse: {
                off: 'Not searching playback responses',
                on: 'Searching playback responses'
            },
            clientResponse: {
                off: 'Not searching client responses',
                on: 'Searching client responses'
            },

            // search on which fields?
            endpointKey: {
                off: 'Not searching on endpoint keys',
                on: 'Searching on endpoint keys'
            },
            requestKey: {
                off: 'Not searching on request keys',
                on: 'Searching on request keys'
            },
            headers: {
                off: 'Not searching in request headers',
                on: 'Searching in request headers'
            },
            body: {
                off: 'Not searching client responses',
                on: 'Searching client responses'
            },
            path: {
                off: 'Not searching message bodies',
                on: 'Searching message bodies'
            }
        };

        var msg = factory.model[key] ? messages[key].on : messages[key].off;

        $mdToast.show($mdToast.simple()
            .content(msg)
            .position('top right'));

    }
}
