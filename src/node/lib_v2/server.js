'use strict';


module.exports = createServer;

var $q = require('q');
var $http = require('http');
var $extend = require('extend');

var verbose = true;
var logger = verbose ? console.log : function() {};


function createServer(options, newConnectionHandler) {

    $http.createServer(connectionHandler).listen(options.proxyPort);
    
    function connectionHandler(req, res) {
        var deferred = $q.defer();

        logger('|  Request: ' + req.url);

        flattenIncomingRequest(req)
            .then(function(flatReq) {

                deferred.resolve({
                    httpResponse: res,
                    request: flatReq
                });
                
            });
        
        newConnectionHandler({
            promise : deferred.promise,
            response: res,
            // duplicate the options object to prevent manipulation of the main config
            opts: $extend({}, options)
        });
    }

}

function flattenIncomingRequest (req, options) {

    options = options || {};
    options.maxIncomingBodyLength = 1e6;

    var deferred = $q.defer();

    var flatReq = {
        url: req.url,
        method: req.method,
        path: req.path,
        headers: req.headers
    };

    req.on('data', function (data) {

        // add request body if not exists
        flatReq.body = flatReq.body || '';

        flatReq.body += data;

        // Too much POST data, kill the connection!
        if (flatReq.body.length > options.maxIncomingBodyLength) {

            req.connection.destroy();
            deferred.reject('Request body data size overflow. Not accepting request bodies larger than ' + (options.maxIncomingBodyLength) + ' bytes');

        }

    });

    req.on('end', function () {

        deferred.resolve(flatReq);

    });

    return deferred.promise;

}
