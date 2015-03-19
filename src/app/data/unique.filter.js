(function() {
    'use strict';

    angular.module('nocca.data')
        .filter('noccaDataUnique', noccaDataUnique);

    function noccaDataUnique () {

        return function (arr, field) {

            var trackingObject = {};
            var returnArray = [];

            for (var i = 0, iMax = arr.length; i < iMax; i += 1) {

                var matchValue = arr[i];

                if (typeof arr[i] === 'object') {
                    matchValue = arr[i][field];
                }

                if (typeof trackingObject[matchValue] === 'undefined') {
                    returnArray.push(arr[i]);
                }

                trackingObject[matchValue] = arr[i];

            }

            return returnArray;
        };

    }

}());