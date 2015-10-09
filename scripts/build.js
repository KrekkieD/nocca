'use strict';

var $path = require('path');
var $fs = require('fs');

var $templateCache = require('./build/template-cache');
var $browserify = require('./build/browserify');
var $sass = require('./build/sass');

var $upTheTree = require('up-the-tree');
var $q = require('q');
var $globby = require('globby');
var $rimraf = require('rimraf');



module.exports = {
    build: build,
    cleanTarget: cleanTarget,
    browserify: $browserify,
    templateCache: $templateCache,
    sass: $sass,
    copyStatic: copyStatic
};

if (!module.parent) {

    console.log('Creating full build');

    module.exports.build()
        .then(function () {
            console.log('all done!');
        })
        .catch(function (err) {
            setTimeout(function () {
                throw err;
            }, 0);
        });

}


function build () {

    return cleanTarget()
        .then(function () {
            $q.allSettled([
                $browserify(),
                $templateCache(),
                $sass(),
                copyStatic()
            ]);
        });
}

function cleanTarget () {

    try {
        $fs.mkdirSync('./ui');
    } catch (e) {}

    return $q.nfcall($rimraf, './ui/*');

}




function copyStatic () {

    return $globby([
        './src/*.html',
        './src/*.ico'
    ]).then(function (files) {

        var deferreds = [];

        files.forEach(function (file) {

            var promise = $q.nfcall($fs.readFile, file)
                .then(function (buffer) {

                    return $q.nfcall($fs.writeFile, $path.resolve('./ui', $path.basename(file)), buffer);

                });

            deferreds.push(promise);

        });

        return $q.all(deferreds);

    });

}
