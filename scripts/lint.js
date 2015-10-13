'use strict';

var $buenosJscs = require('buenos-jscs');
var $buenosJshint = require('buenos-jshint');
var $buenosHtmllint = require('buenos-htmllint');
var $buenosCodetags = require('buenos-codetags');

module.exports = {
    lint: lint
};

if (!module.parent) {

    console.log('Starting linters, this could take some time.');

    lint()
        .then(function (result) {

            if (result.jscsErrors || result.jshintErrors) {
                throw 'Serious linting errors found';
            }
            else {
                console.log('Linting done');
            }

        })
        .catch(function (err) {
            setTimeout(function () {
                throw err;
            }, 0);
        });

}

function lint () {

    var result = {
        jscsErrors: 0,
        jshintErrors: 0,
        htmllintErrors: 0,
        codetagsErrors: 0
    };


    return _jscs()
        .then(function (log) {
            result.jscsErrors = log.totalErrorCount;
        })
        .then(_jshint)
        .then(function (log) {
            result.jshintErrors = log.totalErrorCount;
        })
        .then(_htmllint)
        .then(function (log) {
            result.htmllintErrors = log.totalErrorCount;
        })
        .then(_codetags)
        .then(function (log) {
            result.codetagsErrors = log.totalErrorCount;

            return result;
        })
        .catch(function (err) {
            setTimeout(function () {
                throw err;
            }, 0);
        });

}

function _jscs () {

    return $buenosJscs({
        src: [
            './**/*.js',
            '!./**/node_modules/**/*',
            '!./**/bower_components/**/*',
            '!./ui/**/*'
        ]
    }).promise;

}

function _jshint () {

    return $buenosJshint({
        src: [
            './**/*.js',
            '!./**/node_modules/**/*',
            '!./**/bower_components/**/*',
            '!./**/*.spec.js',
            '!./ui/**/*'
        ]
    }).promise;

}

function _htmllint () {

    return $buenosHtmllint({
        src: [
            './**/*.html',
            '!./**/node_modules/**/*',
            '!./**/bower_components/**/*'
        ]
    }).promise;

}

function _codetags () {

    return $buenosCodetags({
        src: [
            './**/*.*',
            '!./**/node_modules/**/*',
            '!./**/reports/**/*',
            '!./**/target/**/*',
            '!./**/bower_components/**/*',
            '!./ui/**/*'
        ]
    }).promise;

}
