'use strict';

var $serveBogi = require('./helpers/serveBogi');
var $generateRequests = require('./helpers/generateRequests');

$serveBogi.startServer()
    .then(function () {

        $generateRequests.lottaBogi(200);

    });
