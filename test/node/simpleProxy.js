'use strict';

var $nocca2 = require('../../index');

var config = {
	endpoints: {
		'google': {
			targetBaseUrl: 'http://www.google.com/'
		}
	}
};

$nocca2.setup(config);
