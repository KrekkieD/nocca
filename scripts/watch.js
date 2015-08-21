'use strict';

var $path = require('path');

var $watch = require('node-watch');
var $debounce = require('debounce');

var $build = require('./build');

var fullBuild = $debounce(function () {
    $build.build().then(function () {
        console.log('Full build created');
    });
}, 500);

var createAppPackage = $debounce(function () {
    $build.createAppPackage()
        .then(function () {
            console.log('New app package created');
        });
}, 250);

var createTemplateCache = $debounce(function () {
    $build.createTemplateCache()
        .then(function () {
            console.log('New template cache created');
        });
}, 250);

var createCssFile = $debounce(function () {
    $build.createCssFile()
        .then(function () {
            console.log('New CSS package created');
        });

}, 250);

var lastWatchEvent = 0;

$watch('./src', {
    recursive: true
}, function (file) {

    var currentWatchEvent = new Date().getTime();

    var ext = $path.extname(file);

    if (ext === '.js') {
        createAppPackage();
    }
    else if (ext === '.css' || ext === '.scss') {
        createCssFile();
    }
    else if (ext === '.html' && $path.dirname($path.relative('./src', file) !== '.')) {
        createTemplateCache();
    }
    else if (ext !== '') {
        fullBuild();
    }
    else {
        // dir change? only run when wrapped in plenty idle time (500ms)
        if (currentWatchEvent - lastWatchEvent > 500) {

            // return without updating lastWatchEvent value
            return setTimeout(function () {

                // was this trigger still the last one?
                if (currentWatchEvent - lastWatchEvent > 500) {
                    lastWatchEvent = currentWatchEvent;
                    fullBuild();
                }
            }, 500);

        }
    }

    lastWatchEvent = currentWatchEvent;

});

console.log('watching!');
