'use strict';

var $nocca = require(__dirname + '/../index');

module.exports = reporter;

function reporter (context) {

    var data = context.opts.statistics.exporter();

    // TODO: this should come from config!
    $nocca.$httpInterface.broadcast(data);

}