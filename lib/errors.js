'use strict';
var $q = require('q');

module.exports = ErrorHandler;

function ErrorHandler (Nocca) {

    this.chainRejected = chainRejected;

    function chainRejected (reqContext) {

        var deferred = $q.defer();

        Nocca.logWarning('Unable to complete request: ' + reqContext.error);

        var httpResponse = reqContext.httpResponse;

        httpResponse.writeHead(500, {
            'Nocca-Error': '"' + reqContext.error + '"'
        });

        if (reqContext.stack) {
            Nocca.logError(reqContext.stack);
        }

        httpResponse.end(JSON.stringify(reqContext.error));

        deferred.resolve(reqContext);

        return deferred.promise;

    }

}
