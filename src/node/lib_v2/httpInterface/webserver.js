'use strict';

var $http = require('http');
var $url = require('url');
var $scenarioRecorder = require('../scenarioRecorder');

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

        switch (req.method.toUpperCase() + ':' + $url.parse(req.url).pathname) {

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
            case 'POST:/scenarios/startRecording':
                tryStartRecordingScenario(req, res);
                break;
            case 'POST:/scenarios/finishRecording':
                tryStopRecordingScenario(req, res, config.playback.scenarioRecorder);
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
				res.write('Could not open ' + req.url, function() {
				    res.end();
                });

        }

    }

}


function tryStartRecordingScenario(req, res) {
    try {
        var parsedUrl = $url.parse(req.url);
        var title = (parsedUrl.query && parsedUrl.query.title) ? parsedUrl.query.title : undefined;
        
        $scenarioRecorder.startRecordingScenario(title);
        res.write('Started recording', function() {
            res.end();
        });
    } catch (e) {
        res.writeHead(409, 'Already Recording');
        res.write('Recording is already active', function() {
            res.end();
        });
    }
}

function tryStopRecordingScenario(req, res, recorder) {
    try {
        var parsedUrl = $url.parse(req.url, true);
        var scenario = $scenarioRecorder.finishRecordingScenario();

        console.log(parsedUrl);
        console.log(scenario);
        console.log(parsedUrl.query['save']);
        if (parsedUrl.query && parsedUrl.query['save'] == 'true') {
            console.log(scenario);
            recorder(scenario.player());
        }
        
        res.write(JSON.stringify(scenario), function() {
            res.end();
        });
    } catch (e) {
        res.writeHead(409, 'Finish Recording Failed');
        res.write(e.message, function() {
            res.end();
        });
    }
}