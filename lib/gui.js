'use strict';

var $connect = require('connect');
var $serveStatic = require('serve-static');
var $wiredep = require('wiredep');

module.exports = gui;

function gui (Nocca) {

    var app;

    var guiEnabled = false;

    try {
        guiEnabled = Nocca.config.servers.gui.enabled;
    } catch (e) {}

    if (guiEnabled) {

        $wiredep({
            src: __dirname + '/../ui/index.html',
            ignorePath: '/bower_components'
        });

        app = $connect();

        app.use($serveStatic('./ui'));
        app.use($serveStatic('./bower_components'));
        app.listen(Nocca.config.servers.gui.port, function () {
            Nocca.logSuccess('Port:', Nocca.config.servers.gui.port, '-- GUI');
        });

    }

    return app;


}