'use strict';

var $q = require('q');

module.exports = distributedDelay;

module.exports = {
	interface: 'responseDelay',
	id: 'distributedDelay',
	name: 'Distributed Delay Calculater',
	constructor: distributedDelay
};

function distributedDelay (Nocca) {

	this.generateDelay = generateDelay;

	function generateDelay (reqContext) {

		var deferred = $q.defer();

		var delayConfig = reqContext.config.distributedDelay || false;

		if (delayConfig !== false) {

			// deviate is roughly anything between 0-200 with higher probability for 100
			var deviate = generateDeviate(delayConfig.variance);

			// get timeout as percentage of the expectation
			var delayPercentage = 200 - deviate;

			var delay = Math.round(delayConfig.expectation * delayPercentage / 100);

			if (delayConfig.min) {
				delay = Math.min(delay, delayConfig.min);
			}
			if (delayConfig.max) {
				delay = Math.max(delay, delayConfig.max);
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

		deviate -= (deviation / 2);
		deviate /= (deviation / 2);

		deviate *= 100;
		deviate = Math.round(deviate);

		return deviate;

	}

}