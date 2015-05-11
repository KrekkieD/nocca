'use strict';

var $q = require('q');

module.exports = {
	interface: 'responseDelay',
	id: 'distributedDelay',
	name: 'Distributed Delay Calculater',
	constructor: distributedDelay
};

function distributedDelay (Nocca) {

	this.delay = delay;

	function delay (reqContext) {

		var deferred = $q.defer();

		var delayConfig = reqContext.config.distributedDelay || false;

		if (delayConfig !== false) {

			// deviate is roughly anything between -100/100 with higher probability towards 0
			var deviate = generateDeviate(delayConfig.variance);

			// get timeout as percentage of the expectation
			var delayPercentage = 100 - (deviate * -1);

			var delay = Math.round(delayConfig.expectation * delayPercentage / 100);

			if (delayConfig.min) {
				delay = Math.max(delay, delayConfig.min);
			}
			if (delayConfig.max) {
				delay = Math.min(delay, delayConfig.max);
			}

			setTimeout(function () {
				deferred.resolve(reqContext);
			}, delay);

		}
		else {

			deferred.resolve(reqContext);

		}

		return deferred.promise;

	}

	function generateDeviate (variance) {

		// calculate back to a format that we need. minimum is 2 for this to work
		variance = Math.max(Math.ceil(1 / variance), 2);

		var deviate = 0;
		for (var i = 0; i < variance; i++) {
			deviate += Math.random();
		}

		deviate -= (variance / 2);
		deviate /= (variance / 2);

		deviate *= 100;
		deviate = Math.round(deviate);

		return deviate;

	}

}