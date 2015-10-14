'use strict';

var $q = require('q');

module.exports = ErrorHandler;

function ErrorHandler (Nocca) {

    var self = this;

    self.logger = Nocca.logger.child({ module: 'ErrorHandler' });

    self.chainRejected = chainRejected;

    function chainRejected (reqContext, err) {

        var deferred = $q.defer();

        self.logger.error(err.message || err);

        var httpResponse = reqContext.httpResponse;

        httpResponse.writeHead(500, {
            'Nocca-Error': '"' + (err.message || err) + '"'
        });

        httpResponse.end(JSON.stringify(err));

        deferred.resolve(reqContext);

        return deferred.promise;

    }

}
