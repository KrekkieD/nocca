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
        .then(function () {
            console.log('Linting done');
        });

}

function lint () {

    return _jscs()
        .then(_jshint)
        .then(_htmllint)
        .then(_codetags)
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
