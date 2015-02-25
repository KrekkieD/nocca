'use strict';

module.exports = {};
module.exports.init     = initInterface;

var $connect = require('gulp-connect');
var $recorder = require('./recorder');

var $fs = require('fs');
var $path = require('path');


function initInterface(port) {
    var server = $connect.server({
        root: './interface',
        port: port,
        middleware: function () {
            return [
                function (req, res, next) {

                    if (req.url.indexOf('/caches') === 0) {

                        switch (req.method.toLowerCase()) {
                            case 'get':

                                console.log('getting file');

                                // return cache definitions

                                var filePath = $path.resolve('./stub/caches', req.url.replace(/^\/caches\//g, ''));

                                console.log(filePath);
                                console.log($fs.existsSync(filePath));
                                if ($fs.existsSync(filePath)) {
                                    var cacheContent = $fs.readFileSync(filePath);

                                    res.write(cacheContent, function () {

                                        $recorder.loadMocksFromJson(cacheContent);

                                        res.end();

                                    });

                                }
                                else {
                                    res.statusCode = 404;
                                    res.end();
                                }

                                break;
                            case 'post':

                                // save cache definitions


                                break;
                            case 'delete':

                                // empty cache definitions


                                break;
                        }
                        res.write('aye');
                        res.end();

                    }
                    else {
                        next();
                    }

                }
            ];

        }

    });
}