'use strict';

require('./module')
    .filter('noccaDataSearch', noccaDataSearch);

function noccaDataSearch (noccaDataSearchModel) {

    return filterData;

    function filterData (data) {

        var query = noccaDataSearchModel.model.query;

        if (!query) {
            noccaDataSearchModel.search.result = data;
            noccaDataSearchModel.search.count = undefined;
            noccaDataSearchModel.search.active = false;
        }
        else {

            var search = new Search(noccaDataSearchModel.model.query);

            noccaDataSearchModel.search.active = true;
            noccaDataSearchModel.search.count = 0;

            var newResponses = {};
            Object.keys(data.responses).forEach(function (requestHash) {
                var response = data.responses[requestHash];

                // transform into string with relevant data
                var matchString = search.subjectMaker(response);

                if (search.matches(matchString)) {
                    noccaDataSearchModel.search.count++;
                    newResponses[requestHash] = response;
                }

            });

            data.responses = newResponses;
            noccaDataSearchModel.search.result = data;

        }

        return noccaDataSearchModel.search.result;

    }

    function Search (query) {

        var querySplitter = /[, ]/;
        var queryParts = query.split(querySplitter);
        var iMax = queryParts.length;

        this.matches = matches;
        this.subjectMaker = subjectMaker();

        function matches (string) {

            for (var i = 0; i < iMax; i++) {
                if (string.indexOf(queryParts[i]) > -1) {
                    return true;
                }
            }

            return false;

        }

        function subjectMaker () {

            // search in which objects?
            var responseArray = ['clientRequest', 'proxyRequest', 'proxyResponse', 'playbackResponse', 'clientResponse'];
            var relevantResponseArray = [];
            responseArray.forEach(function (responseObjKey) {
                if (noccaDataSearchModel.model[responseObjKey]) {
                    relevantResponseArray.push(responseObjKey);
                }
            });

            // search in which fields?
            var fieldsArray = ['endpointKey', 'requestKey', 'headers', 'body', 'path'];
            var relevantFieldsArray = {};
            fieldsArray.forEach(function (fieldKey) {
                if (noccaDataSearchModel.model[fieldKey]) {
                    relevantFieldsArray[fieldKey] = true;
                }
            });

            return function (response) {

                // dirty way for one-off match -- add stuff to array, json stringify at the end.
                var matchString = [];

                // process active fields that are not responseObj bound
                if (typeof relevantFieldsArray.endpointKey !== 'undefined' &&
                    response.endpoint &&
                    response.endpoint.key) {

                    matchString.push(response.endpoint.key);

                }

                if (typeof relevantFieldsArray.requestKey !== 'undefined' &&
                    response.requestKey) {

                    matchString.push(response.requestKey);

                }

                relevantResponseArray.forEach(function (responseObjKey) {
                    if (response[responseObjKey]) {

                        // process active fields that are responseObj bound
                        if (typeof relevantFieldsArray.headers !== 'undefined' &&
                            response[responseObjKey].headers) {

                            matchString.push(response[responseObjKey].headers);
                        }
                        if (typeof relevantFieldsArray.body !== 'undefined' &&
                            response[responseObjKey].body) {

                            matchString.push(response[responseObjKey].body);
                        }
                        if (typeof relevantFieldsArray.path !== 'undefined' &&
                            response[responseObjKey].path) {

                            matchString.push(response[responseObjKey].path);
                        }

                    }
                });

                return JSON.stringify(matchString);

            };

        }

    }

}
