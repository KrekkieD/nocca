'use strict';

var $yargs = require('yargs').argv;

var $serveBogi = require('./helpers/serveBogi');
var $generateRequests = require('./helpers/generateRequests');

console.log($yargs);

$serveBogi.startServer()
    .then(function () {

        $generateRequests.lottaBogi($yargs._[0] || 100)
			.then(function () {
				console.log('done!');
				$serveBogi.closeServer();
			});

    });
