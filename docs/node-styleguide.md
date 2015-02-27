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
    

## `requiring` own modules

This is only acceptable when:

- The desired module functions are not part of the consumer configuration
- The module required is **NOT** the main instance of the application (i.e. `nocca` from `index.js`).  
  This is important as it creates a dependency in the `require()` order which is error prone.
  
