/* global module */

'use strict';

module.exports = function (config) {

    config.set({
        files: [],

        exclude: [
            '**/bootstrap.js',
            '**/*scenario.js'
        ],

        basePath: './',

        singleRun: true,

        frameworks: ['jasmine', 'angular-filesort'],

        browsers: ['PhantomJS'],

        plugins: [
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-angular-filesort',
            'karma-junit-reporter',
            'karma-coverage',
            'karma-html-reporter'
        ],

        reporters: ['dots', 'coverage', 'junit', 'html'],

        angularFilesort: {
            whitelist: [
                './src/**/*.js'
            ]
        },

        // exclude specs
        preprocessors: {
            './src/**/!(*spec|*scenario).js': ['coverage']
        },

        coverageReporter: {
            reporters: [{
                type: 'html',
                subdir: 'report-html'
            }, {
                type: 'lcov',
                subdir: '.'
            }, {
                type: 'text',
                subdir: '.',
                file: 'text.txt'
            }, {
                type: 'text-summary',
                subdir: '.',
                file: 'text-summary.txt'
            }],

            dir: 'target/reports/karma-coverage',

            subdir: function (browser) {
                if (browser.toLowerCase()
                    .indexOf('phantom') !== -1) {
                    return 'phantom';
                }

                // normalization process to keep a consistent browser name accross different
                // OS
                return browser;
            },

            file: 'coverage.html'
        },

        junitReporter: {
            outputFile: 'target/reports/TESTS-unit.xml',
            suite: 'unit'
        },

        htmlReporter: {
            outputDir: 'target/reports/jasmine',
            templatePath: __dirname + '/test/jasmine/jasmine-template.html'
        }

    });
};
