# Node Styleguide for Nocca

All rules defined are for consistency, clarity and readability.

## Prefix variables of require() modules with `$`  

This allows you to see where the var came from (i.e. not declared in a function, but always up top)

    'use strict';
    
    var $q = require('q');
    
    
    function someFunction () {
    
        // obviously $q is a module as it's prefixed with $
        var deferred = $q.defer();
    
    }

## `require()` modules before defining exports

This allows for export part of required modules

    'use strict';
    
    var $q = require('q');
    
    module.exports = $q;
    
## `export` up top

This gives a clear overview on what you get when you require the module

## Use named function declarations

This allows hoisting functions and exporting them up top

## `requiring` own modules

This is only acceptable when:

- The desired module functions are not part of the consumer configuration
- The module required is **NOT** the main instance of the application (i.e. `nocca` from `index.js`).  
  This is important as it creates a dependency in the `require()` order which is error prone.
  
## Group `require` statements by origin

This gives a concise overview of what is owned and what is used

    'use strict';
    
    // installed modules and Node native modules
    var $http = require('http');
    var $q = require('q');
    var $extend = require('extend');
    
    // own modules
    var $utils = require('./utils');

## Be verbose

Describing what a var contains in the var name is better than using short names and guessing 
what it was a few days later.

    // usage of i is convention
    for (var i = 0; i < 2; i++) { }
    
    // use descriptive name for deferred
    var deferred = $q.defer();
