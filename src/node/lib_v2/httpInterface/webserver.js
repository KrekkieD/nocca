'use strict';

var $http = require('http');

module.exports = {};
module.exports.createServer = createServer;


function createServer (config) {

    return $http.createServer(requestRouter)
        .listen(config.port, function () {
            console.log('HTTP server listening on port ' + config.port);
        });

}

function requestRouter (req, res) {

    switch (req.method.toUpperCase() + ':' + req.url) {

        //
        case 'GET:/caches':
            res.write('ayeee caches here!', function () {
                res.end();
            });
        break;
        // set cache
        case 'POST:/caches':
            res.write('ayeee you gave me new caches!', function () {
                res.end();
            });
        break;

    }

}