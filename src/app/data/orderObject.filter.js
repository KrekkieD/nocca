'use strict';

require('./module')
    .filter('noccaDataOrderObject', noccaDataOrderObject);

function noccaDataOrderObject () {

    return function (items, field, reverse) {

        var filtered = [];
        angular.forEach(items, function (item) {
            filtered.push(item);
        });

        filtered.sort(function (a, b) {
            return (a[field] > b[field] ? 1 : -1);
        });

        if (reverse) {
            filtered.reverse();
        }

        return filtered;

    };

}
