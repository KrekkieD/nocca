'use strict';

var $httpInterface = require('./httpInterface');

module.exports = reporter;

function reporter (context) {

    var data = context.opts.statistics.exporter();

    // TODO: this should come from config!
    $httpInterface.broadcast(data);

}