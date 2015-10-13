/* globals angular */
'use strict';

var $path = require('path');
var $fs = require('fs');

var $q = require('q');
var $globby = require('globby');

module.exports = templateCache;

if (!module.parent) {
    console.log('Creating template cache');
    templateCache()
        .then(function () {
            console.log('Finished creating template cache');
        })
        .catch(function (err) {
            setTimeout(function () {
                throw err;
            }, 0);
        });
}

function templateCache () {

    return $globby([
        './src/app/**/*.html'
    ]).then(function (files) {

        files.sort();

        var injectables = {};

        var deferreds = [];

        files.forEach(function (file) {

            var deferred = $q.defer();
            deferreds.push(deferred.promise);

            var templateUrl = $path.basename(file);

            injectables[templateUrl] = undefined;
            
            $fs.readFile(file, function (err, result) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    injectables[templateUrl] = result.toString();
                    deferred.resolve();
                }
            });

        });

        return $q.allSettled(deferreds)
            .then(function () {

                var tpl = _template.toString().split('\n');

                // remove first and last line of template function
                tpl.pop();
                tpl.shift();

                tpl = tpl.join('\n').replace('\'%s\'', JSON.stringify(injectables));

                return $q.nfcall($fs.writeFile, './ui/templatecache.js', tpl);

            });

    });

}

// this is the actual template for the generated module
function _template () {

    (function (templates) {

        angular.module('nocca.core')
            .run(['$templateCache', run]);

        function run ($templateCache) {

            for (var key in templates) {
                /* istanbul ignore else */
                if (templates.hasOwnProperty(key)) {
                    $templateCache.put(key, templates[key]);
                }
            }

        }

    }('%s'));

}
