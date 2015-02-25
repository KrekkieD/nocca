'use strict';

var $connect = require('connect');
var $serveStatic = require('serve-static');
var $wiredep = require('wiredep');

module.exports = gui;

function gui (config) {

    $wiredep({
        src: __dirname + '/../ui/index.html',
        ignorePath: '/bower_components'
    });

    var app = $connect();

    app.use($serveStatic('./ui'));
    app.use($serveStatic('./bower_components'));
    app.listen(config.gui.port, function () {
        console.log('GUI running on port ' + config.gui.port);
    });

}