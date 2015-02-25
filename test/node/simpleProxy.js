'use strict';

var $nocca2 = require('../../src/node/index');

var config = {
	endpoints: {
		'google': {
			targetBaseUrl: 'http://www.google.com/'
		}
	}
};

$nocca2.setup(config);

$nocca2.gui(config);