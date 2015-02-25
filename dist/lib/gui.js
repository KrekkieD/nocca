'use strict';

var $connect = require('connect');
var $serveStatic = require('serve-static');

module.exports = gui;

function gui (config) {

    var app = $connect();

    app.use($serveStatic('./dist/ui'));
    app.listen(3000);

    console.log('running on 3000');

}