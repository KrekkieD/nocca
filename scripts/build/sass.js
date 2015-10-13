'use strict';

var $fs = require('fs');

var $globby = require('globby');
var $q = require('q');
var $sass = require('node-sass');

module.exports = sass;

function sass () {

    var relativeSrcPath = './src';
    var glob = [
        relativeSrcPath + '/**/!(_)*.scss',
        relativeSrcPath + '/**/*.css'
    ];

    return $globby(glob)
        .then(function (files) {

            files.sort();

            var cssChunks = {};

            var deferreds = [];
            files.forEach(function (file) {

                cssChunks[file] = undefined;

                var deferred = $q.defer();
                deferreds.push(deferred.promise);

                $sass.render({
                    file: file,
                    indentWidth: 4,
                    outputStyle: 'expanded',
                    indentedSyntax: true
                }, function (err, result) {

                    if (err) {
                        throw err;
                    }

                    cssChunks[file] = result.css.toString();
                    deferred.resolve();

                });

            });

            return $q.allSettled(deferreds)
                .then(function () {

                    var parts = [];

                    Object.keys(cssChunks).forEach(function (file) {
                        parts.push(cssChunks[file]);
                    });

                    return $q.nfcall($fs.writeFile, './ui/app.css', parts.join('\n'));

                });

        });

}
