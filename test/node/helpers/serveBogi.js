'use strict';

var $connect = require('connect');
var $q = require('q');

module.exports = {
    startServer: startServer
};

function startServer () {

    var deferred = $q.defer();


    var app = $connect();

    app.use(function (req, res) {

        res.end(JSON.stringify({
            headers: req.headers,
            method: req.method,
            path: req.path
        }, null, 4));

    });

    app.listen(8988, function () {
        deferred.resolve(8988);
    });

    return deferred.promise;

}
