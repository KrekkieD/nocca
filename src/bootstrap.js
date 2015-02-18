(function () {

	'use strict';

	angular.element(document)
		.ready(function () {
			angular.bootstrap(document.getElementById(
				'<%= generator.bootstrap.element %>'), [
				'<%= generator.bootstrap.module %>'
			]);
		});

}());
