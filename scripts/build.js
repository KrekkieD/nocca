'use strict';

var $path = require('path');
var $fs = require('fs');

var $upTheTree = require('up-the-tree');
var $q = require('q');
var $sass = require('node-sass');
var $globStream = require('glob-stream');
var $rimraf = require('rimraf');

// gulp requires here
var $gulp = require('gulp');
var $templateCache = require('gulp-angular-templatecache');
var $angularFilesort = require('gulp-angular-filesort');
var $gulpConcat = require('gulp-concat');


module.exports = {
    build: build,
    cleanTarget: cleanTarget,
    createAppPackage: createAppPackage,
    createTemplateCache: createTemplateCache,
    createCssFile: createCssFile,
    copyStatic: copyStatic
};

if (!module.parent) {
    module.exports.build()
        .then(function () {
            console.log('all done!');
        });
}


function build () {

    return cleanTarget()
        .then(function () {
            $q.allSettled([
                createAppPackage(),
                createTemplateCache(),
                createCssFile(),
                copyStatic()
            ]);
        });
}

function cleanTarget () {

    try {
        $fs.mkdirSync($path.resolve($upTheTree(), 'target'));
    } catch (e) {}

    return $q.nfcall($rimraf, $path.resolve($upTheTree(), 'target') + '/*');

}

function createAppPackage () {

    var deferred = $q.defer();

    $gulp.src([
        $upTheTree() + '/src/**/*.js',
        '!' + $upTheTree() + '/src/**/*.spec.js'
    ])
        .pipe($angularFilesort())
        .pipe($gulpConcat('app.js'))
        .pipe($gulp.dest($upTheTree() + '/target/'))
        .on('end', function () {
            deferred.resolve();
        });

    return deferred.promise;
}

function createTemplateCache () {

    var deferred = $q.defer();

    $gulp.src($upTheTree() + '/src/app/**/*.html')
        .pipe($templateCache({
            module: 'nocca.core',
            transformUrl: function(url) {
                return url.split($path.sep).pop();
            }
        }))
        .pipe($gulp.dest($upTheTree() + '/target/'))
        .on('end', function () {
            deferred.resolve();
        });

    return deferred.promise;

}

function createCssFile () {

    var deferred = $q.defer();

    var relativeSrcPath = './' + $path.relative('.', $upTheTree());
    var glob = [
        relativeSrcPath + 'src/**/*.scss',
        relativeSrcPath + 'src/**/*.css'
    ];


    var deferreds = [];

    var stream = $globStream.create(glob);

    var cssChunks = [];

    stream.on('data', function (file) {

        var deferred = $q.defer();
        deferreds.push(deferred.promise);

        $sass.render({
            file: file.path,
            indentWidth: 4,
            outputStyle: 'expanded',
            indentedSyntax: true
        }, function (err, result) {

            if (!err) {
                cssChunks.push(result.css.toString());
                deferred.resolve();
            }
            else {
                deferred.reject();
            }
        });


    });

    stream.on('end', function () {

        $q.allSettled(deferreds)
            .then(function () {

                $fs.writeFileSync($path.resolve($upTheTree(), 'target/app.css'), cssChunks.join('\n'));

                deferred.resolve();

            });

    });

    return deferred.promise;

}


function copyStatic () {

    var deferred = $q.defer();

    var relativeSrcPath = './' + $path.relative('.', $upTheTree());
    var glob = [
        relativeSrcPath + '/src/*.html',
        relativeSrcPath + '/src/*.ico'
    ];

    var stream = $globStream.create(glob);

    stream.on('data', function (file) {

        $fs.createReadStream(file.path)
            .pipe($fs.createWriteStream($path.resolve($upTheTree(), 'target', $path.basename(file.path))));

    });

    stream.on('end', function () {

        deferred.resolve();

    });

    return deferred.promise;

}
