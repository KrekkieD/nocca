'use strict';

var $upTheTree = require('up-the-tree');
var $extend = require('extend');

var rootTwig = $upTheTree('package.json', { twig: true });

var $nocca = rootTwig.require('.');

module.exports = createNocca;

function createNocca (config) {

    return new $nocca($extend({}, {
        record: true,
        keyGenerator: [
            'cherryPickingKeygen',
            {
                properties: ['path', 'method'],
                url: ['pathname'],
                headers: ['accept', 'content-type']
            }
        ]
    }, config));

}
