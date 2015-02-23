'use strict';

var $http = require('http');

module.exports = {};
module.exports.createServer = createServer;


function createServer (config) {

    return $http.createServer(createRequestRouter(config))
        .listen(config.server.port, function () {
            console.log('HTTP server listening on port ' + config.server.port);
        });

}

function createRequestRouter (config) {

    var router = requestRouter;
    router.config = config;

    return router;

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
                res.write('ayeee you gave me caches to add!', function () {
                    res.end();
                });
                break;
            case 'PUT:/caches':
                res.write('ayeee you gave me fresh caches!', function () {
                    res.end();
                });
                break;
            // create a new cache package
            case 'POST:/caches/package':

                var body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {

                    if (body !== '') {
                        try {
                            body = JSON.parse(body);
                        }
                        catch (e) {
                            res.writeHead(400, 'Bad request', {
                                'Access-Control-Allow-Origin': '*'
                            });
                            res.write('Request body could not be parsed, is it a valid JSON string?');
                            res.end();
                        }
                    }


                    // parse body and extract requested keys
                    if (body === '') {
                        body = {};
                    }

                    var recordings = router.config.playback.exporter();

                    // extract from recordings
                    var downloadObj = {};

                    if (typeof body.requestKeys !== 'undefined') {
                        body.requestKeys.forEach(function (value) {
                            downloadObj[value] = recordings[value];
                        });
                    }
                    else {
                        // if no keys specified just download all recorded
                        downloadObj = recordings;
                    }


                    res.writeHead(200, {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    });

                    res.write(JSON.stringify(downloadObj), function () {
                        res.end();
                    });

                });

                break;
			default:
				res.writeHead(404, 'Not found', {
					'Access-Control-Allow-Origin': '*'
				});
				res.write('Could not open ' + req.url);
				res.end();

        }

    }

}

