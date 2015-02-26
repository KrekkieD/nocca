'use strict';

var $q = require('q');
var $extend = require('extend');

module.exports = {};
module.exports.defaultGenerator = combineGenerators(requestWithoutBodyKeyGeneratorBuilder());
module.exports.requestWithoutBodyKeyGeneratorBuilder = requestWithoutBodyKeyGeneratorBuilder;
module.exports.urlOnlyKeyGeneratorBuilder = urlOnlyKeyGeneratorBuilder;
module.exports.methodOnlyKeyGeneratorBuilder = methodOnlyKeyGeneratorBuilder;
module.exports.headersOnlyKeyGeneratorBuilder = headersOnlyKeyGeneratorBuilder;
module.exports.urlAndHeadersKeyGeneratorBuilder = urlAndHeadersKeyGeneratorBuilder;
module.exports.bodyRegexKeyGeneratorBuilder = bodyRegexKeyGeneratorBuilder;
module.exports.overridableKeyGeneratorBuilder = overridableKeyGeneratorBuilder;


function combineGenerators() {
    
    var generators = unwrapGenerators(Array.prototype.slice.call(arguments));
    if (generators.length === 0) { throw Error('Need at least one generator!'); }

    var generatorFunction = function(reqContext) {
        var d = $q.defer();
        
        var key = {};
        for (var i = 0; i < generators.length; i++) {
            $extend(key, generators[i](reqContext));
        }

        reqContext.requestKey = JSON.stringify( key );

        console.log('|    Generated request key: ' + reqContext.requestKey);

        d.resolve(reqContext);
        return d.promise;
    };
    
    generatorFunction.generators = generators;
    
    return generatorFunction;
    
}

function unwrapGenerators(generators) {
    var unwrappedGenerators = [];
    
    for (var i = 0; i < generators.length; i++) {
        if (generators[i].generators) {
            unwrappedGenerators = unwrappedGenerators.concat(generators[i].generators);
        }
        else {
            unwrappedGenerators.push(generators[i]);
        }
    }
    
    return unwrappedGenerators;
}

function requestWithoutBodyKeyGeneratorBuilder() {
    return combineGenerators(urlOnlyKeyGeneratorBuilder(), headersOnlyKeyGeneratorBuilder(), methodOnlyKeyGeneratorBuilder());
}

function urlOnlyKeyGeneratorBuilder(opts) {
    
    return combineGenerators(function(reqContext) {
        return {
            url: reqContext.request.url
        };
    });
    
}

function methodOnlyKeyGeneratorBuilder(opts) {
    
    return combineGenerators(function(reqContext) {
        return {
            method: reqContext.request.method
        };
    });
}

function headersOnlyKeyGeneratorBuilder(opts) {
    var filteredHeaders = {};
    if (opts && typeof opts.filteredHeaders !== 'undefined') {
        opts.filteredHeaders.forEach(function(header) {
            filteredHeaders[header.toLowerCase()] = true;
        });
    }
    
    return function(reqContext) {
        var headersArray = [];

        // stuff it in an array so that we can sort the order of the headers.
        // This will prevent any weird non-matching issues due to header order
        Object.keys(reqContext.request.headers).forEach(function (headerKey) {
            if (filteredHeaders[headerKey] !== true) {
                headersArray.push(headerKey + ':' + reqContext.request.headers[headerKey]);
            }
        });

        return {
            headers: headersArray.sort()
        };
    };
    
}

function urlAndHeadersKeyGeneratorBuilder(opts) {
    return combineGenerators(urlOnlyKeyGeneratorBuilder(opts), headersOnlyKeyGeneratorBuilder(opts));
}

function bodyRegexKeyGeneratorBuilder(opts) {
    
    return function(reqContext) {
        
        throw Error('bodyRegex key generator is not implemented');
        
    };
    
}

// Builds a keyGenerator that allows an endpoint's generator to take precedence
// over the configured default
function overridableKeyGeneratorBuilder(defaultGenerator) {
    
    return function(reqContext) {
        
        if (reqContext.endpoint.definition.keyGenerator) {
            return reqContext.endpoint.definition.keyGenerator(reqContext);
        }
        else {
            return defaultGenerator(reqContext);
        }
        
    };
    
}