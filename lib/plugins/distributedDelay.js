'use strict';

var $q = require('q');

module.exports = {
	interface: 'responseDelay',
	id: 'distributedDelay',
	name: 'Distributed Delay Calculater',
	constructor: distributedDelay
};

function distributedDelay (Nocca) {

	var self = this;

	self.invoke = invoke;

	function invoke (pluginConfig) {

		return function (reqContext) {
			return delay(reqContext, pluginConfig);
		};

	}

	function delay (reqContext, pluginConfig) {

		var deferred = $q.defer();

		var delayConfig = pluginConfig || false;

		var delay = 0;

		if (delayConfig !== false) {

			// deviate is roughly anything between -100/100 with higher probability towards 0
			var deviate = generateDeviate(delayConfig.variance);

			// get timeout as percentage of the expectation
			var delayPercentage = 100 - (deviate * -1);

			delay = Math.round(delayConfig.expectation * delayPercentage / 100);

			if (delayConfig.min) {
				delay = Math.max(delay, delayConfig.min);
			}
			if (delayConfig.max) {
				delay = Math.min(delay, delayConfig.max);
			}

			// calculate how long this request has already been running
			var progressedTime = new Date().getTime() - reqContext.requestStartTime;

			// deduct that from the delay, but make sure to have a minimum of 0
			delay = Math.max(0, delay - progressedTime);

		}

		if (delay > 0) {

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