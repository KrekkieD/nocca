'use strict';

var $moment = require('moment');
var $extend = require('extend');

module.exports = {
    interface: 'messageTransformer',
    id: 'simpleMessageTransformer',
    name: 'Simple Message Transformer',
    description: 'String-based configuration powered message transformer, allows setup through JSON',
    readme: '/docs/plugins/simpleMessageTransformer.md',
    constructor: CacheQueue
};

function CacheQueue (Nocca) {

    var self = this;

    self.invoke = invoke;

    function invoke (pluginConfig) {

        return function (reqContext, httpMessage) {

            return transformMessage(httpMessage, pluginConfig);

        };

    }

    function transformMessage (httpMessage, pluginConfig) {

        Nocca.logSuccess('Transforming message');

        // process transformation array
        pluginConfig.forEach(function (transformation) {

            // perform search with replacement as callback
            var search = _getSearchFunction(transformation);

            var replacement = _getReplacementFunction(transformation, httpMessage);



            var transformedHttpMessage = search(httpMessage.dump(), replacement);
            httpMessage.unDump(transformedHttpMessage);

        });

        return httpMessage;

    }

    function _getSearchFunction (transformation) {

        if (transformation.search.type === 'regex') {

            return function (httpMessage, replacementFunction) {

                // support for regex flags
                var searchValue = transformation.search.value;
                if (!Array.isArray(searchValue)) {
                    searchValue = [searchValue];
                }
                if (searchValue.length === 1) {
                    searchValue.push(undefined);
                }

                switch (transformation.search.subject) {
                    case 'body':

                        httpMessage.body = httpMessage.body.replace(
                            new RegExp(searchValue[0], searchValue[1]),
                            replacementFunction
                        );

                        break;
                    default:
                        Nocca.logError('Subject ' + transformation.search.subject + ' is not supported');
                }

                return httpMessage;

            };

        }

        Nocca.logError('Search type ' + transformation.search.type + ' is not supported');

    }

    function _getReplacementFunction (transformation, httpMessage) {

        if (transformation.replace.type === 'math') {

            return function (match, submatch) {

                var value = parseInt(submatch, 10);

                // which math transformation will we perform?
                var mathTransformation = parseInt(transformation.replace.value, 10);
                if (mathTransformation.toString() !== 'NaN') {
                    // simple add
                    value = value + mathTransformation;
                }
                else {
                    // first char will identify the action
                    switch (transformation.replace.value.charAt(0)) {
                        case '*':

                            mathTransformation = parseInt(transformation.replace.value.substr(1));
                            value = value * mathTransformation;

                            break;
                        case '/':

                            mathTransformation = parseInt(transformation.replace.value.substr(1));
                            value = value / mathTransformation;

                            break;
                        default:
                            Nocca.logError('Unsupported math transformation: ' + transformation.replace.value);
                    }
                }

                return match.replace(submatch, value);

            };

        }
        else if (transformation.replace.type === 'momentjs') {

            return function (match, submatch) {

                var currentTime = $moment();
                var options = $extend(true, {}, transformation.replace.options || {});

                // read current value
                options.source = options.source || {};
                options.source.value = (options.source.hasOwnProperty('value') ? options.source.value : submatch) || currentTime.toISOString();
                options.source.format = options.source.format || $moment.ISO_8601;

                var date = $moment(options.source.value, options.source.format);

                if (typeof options.patchTimeDifference !== 'undefined') {

                    // diff is based on httpMessage time and submatch value time
                    var messageTime = $moment(httpMessage.created);
                    // calculate diff in millisecs
                    var msDiffTime = date.diff(messageTime);

                    // then process that diff on to the current time
                    if (msDiffTime < 0) {
                        msDiffTime = msDiffTime * -1;
                        date = $moment(currentTime).subtract(msDiffTime, 'ms');
                    }
                    else {
                        date = $moment(currentTime).add(msDiffTime, 'ms');
                    }

                }

                // add?
                if (typeof options.add !== 'undefined') {
                    date.add(options.add);
                }

                // subtract?
                if (typeof options.subtract !== 'undefined') {
                    date.subtract(options.subtract);
                }


                // format
                options.format = (options.hasOwnProperty('format') ? options.format : '') || undefined;
                date = date.format(options.format);

                // and replace
                return match.replace(submatch, date);

            };

        }

    }

}
