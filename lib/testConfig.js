var _ = require('lodash');

var $plugin1 = function() {};
var $plugin2 = function() {};
var $plugin3 = function() {};
var $plugin4 = function() {};

function Nocca() {
    var pluginFunctions = _.toArray(arguments);
    
    
    
}

var $nocca = new Nocca($plugin1, $plugin2, $plugin3, $plugin4);