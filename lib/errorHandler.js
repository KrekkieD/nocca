'use strict';

var $q = require('q');

module.exports = ErrorHandler;

function ErrorHandler (Nocca) {

    var self = this;

    self.logger = Nocca.logger.child({ module: 'ErrorHandler' });

    self.chainRejected = chainRejected;

    function chainRejected (reqContext) {

        var deferred = $q.defer();

        self.logger.warn('Unable to complete request: ' + reqContext.error);

        var httpResponse = reqContext.httpResponse;

        httpResponse.writeHead(500, {
            'Nocca-Error': '"' + reqContext.error + '"'
        });

        if (reqContext.stack) {
            self.logger.error(reqContext.stack);
        }

        httpResponse.end(JSON.stringify(reqContext.error));

        deferred.resolve(reqContext);

        return deferred.promise;

    }

}
