'use strict';

module.exports = reporter;

var $httpInterface = require('./httpInterface');

function reporter (context) {

    var data = context.opts.statistics.exporter();

    $httpInterface.broadcast(data);

}