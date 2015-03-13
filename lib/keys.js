'use strict';
// TODO: should be instance! cannot use Nocca instance references now.

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
module.exports.urlRegexKeyGeneratorBuilder = urlRegexKeyGeneratorBuilder;
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

        // Nocca.logDebug('Generated request key: ' + reqContext.requestKey);

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
            url: reqContext.getClientRequest().path
        };
    });
    
}

function methodOnlyKeyGeneratorBuilder(opts) {
    
    return combineGenerators(function(reqContext) {

        var req = reqContext.getClientRequest();
        return {
            method: req.method
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

        var headers = reqContext.getClientRequest().headers;

        // stuff it in an array so that we can sort the order of the headers.
        // This will prevent any weird non-matching issues due to header order
        Object.keys(headers).forEach(function (headerKey) {
            if (filteredHeaders[headerKey] !== true) {
                headersArray.push(headerKey + ':' + headers[headerKey]);
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
    if (!opts || !opts.hasOwnProperty('regex')) { throw Error('Need to at least have a "regex" property'); }

    return combineGenerators(function(reqContext) {

        var req = reqContext.getClientRequest();
        return {
            bodyRegex: regexExtractor(new RegExp(opts.regex, opts.options), req.getBody(), opts)
        };
    });
    
}

function urlRegexKeyGeneratorBuilder(opts) {
    if (!opts || !opts.hasOwnProperty('regex')) { throw Error('Need to at least have a "regex" property'); }

    return combineGenerators(function(reqContext) {

        var req = reqContext.getClientRequest();

        return {
            urlRegex: regexExtractor(new RegExp(opts.regex, opts.options), req.path, opts)
        };
    });

}

function regexExtractor(regex, source, opts) {
    var result = [];

    var match = regex.exec(source);
    do {
        if (match) {
            if (opts.extractKeys) {
                var subKey = {};
                // Extract specific keys from each match
                Object.keys(opts.extractKeys).forEach(function(key) {
                    subKey[key] = match[opts.extractKeys[key]];
                });
                result.push(subKey);
            }
            else {
                // Simply store the entire match
                result = result.concat(match);            //
            }
        }
    } while (regex.global && (match = regex.exec(source)));

    return result;
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
