'use strict';

module.exports = {};
module.exports.defaultGenerator = defaultKeyGenerator;

var $q = require('q');

function defaultKeyGenerator (reqContext) {

    var d = $q.defer();
    
    var headersArray = [];
    var req = reqContext.request;

    // stuff it in an array so that we can sort the order of the headers.
    // This will prevent any weird non-matching issues due to header order
    Object.keys(req.headers).forEach(function (headerKey) {
        headersArray.push(headerKey + ':' + req.headers[headerKey]);
    });

    // create unique key
    var reqKeyObj = {
        url: req.url,
        method: req.method,
        headers: headersArray.sort(),
        body: ''
    };

    reqContext.requestKey = JSON.stringify(reqKeyObj);
    
    console.log('|    Generated request key: ' + reqContext.requestKey);
    
    d.resolve(reqContext);
    
    return d.promise;
}
