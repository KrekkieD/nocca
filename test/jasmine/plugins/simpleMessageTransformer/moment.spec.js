'use strict';

var $http = require('http');
var $fs = require('fs');

var $moment = require('moment');
var $upTheTree = require('up-the-tree');

var testTwig = $upTheTree('../test', {
    start: __dirname,
    twig: true
});

var $server = testTwig.require('./servers/default');
var $nocca = testTwig.require('./noccas/default');

var server;
var nocca;

describe('plugins/simpleMessageTransformer MOMENT', function () {


    // it should start server
    it ('should start the dummy server', function (done) {

        server = $server(done);

    });

    it ('should start a nocca server', function () {

        nocca = $nocca();

    });

    // add some time
    it ('should perform a request and add some time to a response timestamp', function (done) {

        var timestamp = $moment();
        var timestampString = '<addtimestamp>' + timestamp.format('x') + '</addtimestamp>';
        var timestampStringAddDay = '<addtimestamp>' + timestamp.add(1, 'days').format('x') + '</addtimestamp>';

        $server.request('/proxy/plugins/simple-message-transformer', timestampString)
            .then(function (res) {

                // confirm original timestampString is no longer present
                expect(res.body.indexOf(timestampString)).toEqual(-1);

                // confirm timestampString has a day added
                expect(res.body.indexOf(timestampStringAddDay)).toEqual(-1);

                done();

            });

    });


    // subtract some time
    it ('should perform a request and subtract some time', function (done) {

        var timestamp = $moment();
        var timestampString = '<subtracttimestamp>' + timestamp.format('x') + '</subtracttimestamp>';
        var timestampStringSubtractDay = '<subtracttimestamp>' + timestamp.subtract(1, 'days').format('x') + '</subtracttimestamp>';

        $server.request('/proxy/plugins/simple-message-transformer', timestampString)
            .then(function (res) {

                // confirm original timestampString is no longer present
                expect(res.body.indexOf(timestampString)).toEqual(-1);

                // confirm timestampString has a day added
                expect(res.body.indexOf(timestampStringSubtractDay)).toEqual(-1);

                done();

            });

    });

    // unixtime something

    // diff something
    it ('should perform a request diff, increasing a timestamp by a calculated difference', function (done) {


        // this request is used to create the cache, request is not used in test.
        var originalNow = $moment(1434960000000);

        var body = JSON.stringify({
            currentTimestamp: $moment(originalNow).format('x'),
            dayTimestamp: $moment(originalNow).add(1, 'days').format('x'),
            weekTimestamp: $moment(originalNow).add(1, 'week').format('x'),
            monthTimestamp: $moment(originalNow).add(1, 'month').format('x')
        });


        //first fill Nocca with a cached response
        $server.addCaches($fs.readFileSync(__dirname + '/resources/diffCache.scenario.json'))
            .then(function () {

                var now = $moment();

                body = '';

                $server.request('/proxy/plugins/simple-message-transformer/diff', JSON.stringify(body))
                    .then(function (res) {

                        var responseBody = JSON.parse(res.body).body;

                        // we apply a 10 second max difference range to catch any delays in the request
                        var min = -10000;
                        var max = 10000;

                        // parse the resulting timestamps

                        // the "current" timestamp has hardly any difference between request timestamp and message body timestamp,
                        // so should still be close to current timestamp
                        var current = parseInt(responseBody.currentTimestamp);
                        expect($moment(current).diff(now)).toBeGreaterThan(min);
                        expect($moment(current).diff(now)).toBeLessThan(max);

                        var day = parseInt(responseBody.dayTimestamp);
                        expect($moment(day).diff($moment(now).add(1, 'days'))).toBeGreaterThan(min);
                        expect($moment(day).diff($moment(now).add(1, 'days'))).toBeLessThan(max);

                        var week = parseInt(responseBody.weekTimestamp);
                        expect($moment(week).diff($moment(now).add(1, 'weeks'))).toBeGreaterThan(min);
                        expect($moment(week).diff($moment(now).add(1, 'weeks'))).toBeLessThan(max);

                        var month = parseInt(responseBody.monthTimestamp);
                        expect($moment(month).diff($moment(now).add(1, 'months'))).toBeGreaterThan(min);
                        expect($moment(month).diff($moment(now).add(1, 'months'))).toBeLessThan(max);


                        done();

                    });

            });

    });

    // it should stop the server
    it ('should stop the server', function () {

        server.close();
        nocca.wrapperServer.server.close();

    });

});
