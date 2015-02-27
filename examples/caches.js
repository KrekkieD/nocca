'use strict';

'use strict';

module.exports = Caches;

function Caches (Nocca) {

    var self = this;

    // required interface!
    self.addCacheEndpoint = addCacheEndpoint;
    self.cacheSelector = cacheSelector;

    var endpoints = {};

    function addCacheEndpoint (name, config) {

        endpoints[name] = config;

    }

    /**
     * It would be good practice to use promises here so you can resolve or reject
     */
    function cacheSelector (reqContext) {

        // extract the first part of the path (i.e. /google/sjampoo -> google)
        var firstPathPart = reqContext.request.url.split('/')[1];

        // then return the cache config with that name
        return endpoints[firstPathPart];

    }

}
