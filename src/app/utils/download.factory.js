'use strict';

require('./module')
    .factory('noccaUtilsDownload', noccaUtilsDownload);

function noccaUtilsDownload (
    $http,
    $mdDialog,
    localStorageService
) {

    var factory = {
        createPackageAndSave: createPackageAndSave,
        createPackage: createPackage,
        saveDialog: saveDialog
    };

    return factory;

    function createPackageAndSave () {

        createPackage()
            .then(saveDialog)
            .then(performSave);

    }

    function createPackage () {

        return $http({
            // TODO: host should be dynamic, probably
            url: 'http://localhost:3005/caches/package',
            method: 'post'
        }).then(function (response) {

            return {
                type: response.headers('Content-Type'),
                data: response.data
            };

        });

    }

    function saveDialog (saveData) {

        return $mdDialog.show({
            template: '<md-dialog nocca-utils-download-dialog></md-dialog>'
        })
        .then(function (filename) {

            // add filename to obj
            saveData.fileName = filename;
            return saveData;

        }, function () {
            $mdDialog.hide();
        });

    }

    function performSave (saveConfig) {

        new Blob([
            JSON.stringify(saveConfig.data, null, 4)
        ], {
            type: saveConfig.type + ';charset=utf-8;'
        });

    }

}
