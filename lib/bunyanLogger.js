'use strict';

var $stream = require('stream');

var $bunyan = require('bunyan');
var $colors = require('colors');
var $extend = require('extend');

module.exports = BunyanLogger;

function BunyanLogger (Nocca, pluginConfig) {

    var self = this;

    var DEFAULT_CONFIG = {
        name: 'Nocca',
        stream: createWritable(),
        level: 'Info'
    };

    return invoke(pluginConfig);

    function invoke(pluginConfig) {

        self.logger = self.logger || createLogger(pluginConfig);

        return self.logger;

    }


    function createLogger (pluginConfig) {

        var config = $extend({}, DEFAULT_CONFIG, pluginConfig);

        return $bunyan.createLogger(config);

    }

    function createWritable () {

        var colors = {
            trace: $colors.white,
            debug: $colors.white,
            info: $colors.green,
            warn: $colors.bold.yellow,
            error: $colors.red,
            fatal: $colors.red
        };

        var writable = new $stream.Writable();
        writable.write = function (chunk) {

            var line = JSON.parse(chunk);

            var level = $bunyan.nameFromLevel[line.level];

            console.log([
                $colors.grey(line.time),
                colors[level](level.toUpperCase()),
                line.msg,
                '(' + line.module + ')'
            ].join(' '));

        };

        return writable;

    }

}
