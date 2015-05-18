(function() {
    'use strict';

    angular.module('nocca.data')
        .filter('noccaDataObjectLength', noccaDataObjectLength);

    function noccaDataObjectLength () {

        return function (obj) {

			var length = 0;
            if (Array.isArray(obj)) {
                length = obj.length;
            }
			else if (typeof obj === 'object') {
				length = Object.keys(obj).length;
			}
			return length;

        };

    }

}());