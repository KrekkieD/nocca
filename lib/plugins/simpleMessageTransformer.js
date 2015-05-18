'use strict';


module.exports = {
    interface: 'messageTransformer',
    id: 'simpleMessageTransformer',
    name: 'Simple Message Transformer',
    description: 'String-based configuration powered message transformer, allows setup through JSON',
    constructor: cacheQueue
};

function cacheQueue (Nocca) {

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

            var replacement = _getReplacementFunction(transformation);

            var transformedHttpMessage = search(httpMessage.dump(), replacement);
            httpMessage.unDump(transformedHttpMessage);

        });

        return httpMessage;

    }

    function _getSearchFunction (transformation) {

        if (transformation.search.type === 'regex') {

            return function (httpMessage, replacementFunction) {

                switch (transformation.search.subject) {
                    case 'body':

                        httpMessage.body = httpMessage.body.replace(
                            new RegExp(transformation.search.value),
                            replacementFunction
                        );

                        break;
                    default:
                        Nocca.logError('Subject ' + transformation.search.subject + ' is not supported');
                }

                return httpMessage;

            }

        }

        Nocca.logError('Search type ' + transformation.search.type + ' is not supported');

    }

    function _getReplacementFunction (transformation) {

        if (transformation.replace.type === 'math') {

            return function (match, submatch) {

                var value = parseInt(submatch);

                // which math transformation will we perform?
                var mathTransformation = parseInt(transformation.replace.value);
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

            }

        }
        else if (transformation.replace.type === 'date') {

            return function (match, submatch) {

                var date = new Date();

                var value = date;

                switch (transformation.replace.value) {
                    case 'unixtime':

                        value = date.getTime();

                        break;
                }

                return match.replace(submatch, value);

            }

        }

    }

}