'use strict';

var $chalk = require('chalk');

module.exports = logger;
module.exports.error = error;
module.exports.warning = warning;
module.exports.success = success;
module.exports.info = info;
module.exports.debug = debug;
module.exports.disabled = disabled;


function logger () {

    console.log.apply(null, _argumentsToDecoratedArray(arguments));

}

function error () {

    logger.apply(null, _argumentsToDecoratedArray(arguments, $chalk.bold.red));

}

function warning () {

    logger.apply(null, _argumentsToDecoratedArray(arguments, $chalk.yellow));

}

function success () {

    logger.apply(null, _argumentsToDecoratedArray(arguments, $chalk.green));

}

function info () {

    logger.apply(null, _argumentsToDecoratedArray(arguments, $chalk.white));

}

function debug () {

    logger.apply(null, _argumentsToDecoratedArray(arguments, $chalk.gray));

}

function disabled () {}

function _argumentsToDecoratedArray (argsObj, mapFunction) {

    var arr = [];

    Object.keys(argsObj).forEach(function (key) {
        arr.push(argsObj[key]);
    });

    if (typeof mapFunction === 'function') {
        var decoratedArr = arr.map(function (value) {
            return mapFunction(value);
        });
        arr = decoratedArr;
    }

    return arr;
}
