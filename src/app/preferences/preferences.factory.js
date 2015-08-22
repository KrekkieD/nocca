(function() {
    'use strict';

    angular.module('nocca.preferences')
        .factory('noccaPreferences', noccaPreferences);

    function noccaPreferences() {
        // values here

        var factory = {
			properties: undefined,
			toggleProperty: toggleProperty,
			getProperty: getProperty
        };

        return factory;

		function toggleProperty (attr) {

			return _setLocalStorage(attr, !_getLocalStorage(attr));

		}

		function getProperty (attr, defaultValue) {


			if (typeof _getLocalStorage(attr) === 'undefined' &&
				typeof defaultValue !== 'undefined') {

				return _setLocalStorage(attr, defaultValue);
			}

			return _getLocalStorage(attr);

		}

		function _setLocalStorage (attr, value) {

			var obj = _getLocalStorageObject();
			obj[attr] = value;

			_setLocalStorageObject(obj);

			return obj[attr];

		}

		function _getLocalStorage (attr) {

			return _getLocalStorageObject()[attr];

		}

		function _getLocalStorageObject (forceRefresh) {

			if (!forceRefresh && factory.properties) {
				return factory.properties;
			}

			var storageString = localStorage.getItem('noccaPreferences');

			if (storageString === null) {
				storageString = _setLocalStorageObject({});
			}

			var storageObject = JSON.parse(storageString);

			factory.properties = storageObject;

			return storageObject;

		}

		function _setLocalStorageObject (storageObject) {

			var storageString = JSON.stringify(storageObject);

			localStorage.setItem('noccaPreferences', storageString);

			// update local reference
			_getLocalStorageObject(true);

			return storageString;

		}


    }

}());
