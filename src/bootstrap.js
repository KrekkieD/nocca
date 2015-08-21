(function () {

	'use strict';

	angular.element(document)
		.ready(function () {
			angular.bootstrap(document.getElementById(
				'noccaCore'), [
				'nocca.core'
			]);
		});

}());
