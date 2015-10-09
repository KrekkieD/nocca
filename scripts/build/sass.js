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

            var cssChunks = [];

            var deferreds = [];
            files.forEach(function (file) {

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

                    cssChunks.push(result.css.toString());
                    deferred.resolve();

                });

            });

            return $q.allSettled(deferreds)
                .then(function () {

                    return $q.nfcall($fs.writeFile, './ui/app.css', cssChunks.join('\n'));

                });

        });

}
