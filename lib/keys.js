'use strict';
// TODO: should be instance! cannot use Nocca instance references now.

var $utils = require('./utils');

var $q = require('q');
var $extend = require('extend');
var $xpath = require('xpath');
var $xmldom = require('xmldom');

var $url = require('url');

module.exports = {};
module.exports.defaultGenerator = combineGenerators(requestWithoutBodyKeyGeneratorBuilder());
module.exports.cherryPicking = cherryPicking;
module.exports.incrementalKeyGenerator = incrementalKeyGenerator;
module.exports.requestWithoutBodyKeyGeneratorBuilder = requestWithoutBodyKeyGeneratorBuilder;
module.exports.urlOnlyKeyGeneratorBuilder = urlOnlyKeyGeneratorBuilder;
module.exports.methodOnlyKeyGeneratorBuilder = methodOnlyKeyGeneratorBuilder;
module.exports.headersOnlyKeyGeneratorBuilder = headersOnlyKeyGeneratorBuilder;
module.exports.urlAndHeadersKeyGeneratorBuilder = urlAndHeadersKeyGeneratorBuilder;
module.exports.bodyRegexKeyGeneratorBuilder = bodyRegexKeyGeneratorBuilder;
module.exports.urlRegexKeyGeneratorBuilder = urlRegexKeyGeneratorBuilder;


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
        console.log('Generated request key: ' + reqContext.requestKey);

        d.resolve(reqContext);
        return d.promise;
    };
    
    generatorFunction.generators = generators;
    
    return generatorFunction;
    
}

function cherryPicking (reqContext) {

    var deferred = $q.defer();

    var requestKeyParam = reqContext.config.requestKeyParams;

    var req = reqContext.getClientRequest();

    var requestKey = {};

    if (typeof requestKeyParam.properties !== 'undefined') {

        requestKey.properties = {};

        requestKeyParam.properties.forEach(function (property) {
            if (typeof req[property] !== 'undefined') {
                requestKey.properties[property] = req[property];
            }
        });

    }

    if (typeof requestKeyParam.query !== 'undefined') {
        // parsing query params
        // parsing path params, use url parser
        requestKey.query = {};

        var url = $url.parse(req.path, true);

        requestKeyParam.query.forEach(function (queryParam) {

            if (typeof url.query[queryParam] !== 'undefined') {
                requestKey.query[queryParam] = url.query[queryParam];
            }

        });

    }

    if (typeof requestKeyParam.headers !== 'undefined') {
        // parsing headers, should be an array, simply fetch and add
        // start with empty obj
        requestKey.headers = {};

        requestKeyParam.headers.forEach(function (headerKey) {
            if (typeof req.headers[headerKey] !== 'undefined') {
                requestKey.headers[headerKey] = req.headers[headerKey];
            }
        });

    }

    if (typeof requestKeyParam.body !== 'undefined') {
        // parsing body

        // start with empty object
        requestKey.body = {};

        if (typeof requestKeyParam.body.xpath !== 'undefined') {
            // xpath querying!

            requestKey.body.xpath = {};

            try {

                var body;
                body = new $xmldom().parseFromString(req.body);

                if (typeof body !== 'undefined') {

                    requestKey.body.xpath.forEach(function (xpathQuery) {

                        var nodes = xpath.select(xpathQuery, body);
                        if (nodes && nodes[0]) {
                            requestKey.body.xpath[xpathQuery] = nodes[0].toString();
                        }

                    });

                }

            } catch (e) {}

        }

        if (typeof requestKeyParam.body.json !== 'undefined') {
            // json querying!

            requestKey.body.json = [];

            try {
                var body;
                body = JSON.parse(req.body);

                if (typeof body !== 'undefined') {

                    requestKeyParam.body.json.forEach(function (jsonKey) {

                        var value = $utils.extractConfig(jsonKey, body);

                        if (typeof value !== 'undefined') {
                            requestKey.body.json[jsonKey] = value;
                        }

                    });

                }


            } catch (e) {}

        }

    }

    reqContext.requestKey = JSON.stringify(requestKey);

    deferred.resolve(reqContext);

    return deferred.promise;

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

function incrementalKeyGenerator () {
    var increment = {};
    return combineGenerators(function (reqContext) {
        var path = reqContext.getClientRequest().path;
        increment[path] = increment[path] || 0;
        return { increment: increment[path]++ };
    });
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
