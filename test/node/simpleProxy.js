'use strict';

var $nocca = require('../../index');

var config = {
	endpoints: {
		'google': {
			targetBaseUrl: 'http://www.google.com/'
		}
	}
};

$nocca(config);
