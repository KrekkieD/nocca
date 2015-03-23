'use strict';

var _ = require('lodash');
var $utils = require('./utils');

module.exports = Playback;

function Playback (Nocca) {

    var repositoryPlaybackEnabled = {};

    this.findMatchingRequest = findMatchingRequest;
    this.init = init;


    function init () {

        _.reduce(Nocca.repositories, function (acc, repository) {
            acc[repository.name()] = true;
            return acc;
        }, repositoryPlaybackEnabled);

        var routes = [
            ['GET:/repositories/', listRepositories],
            ['GET:/repositories/:repositoryKey/playback/enabled', true, getRepositoryStatus],
            ['PUT:/repositories/:repositoryKey/playback/enabled', true, setRepositoryStatus]
        ];

        routes.forEach(function (routeConfig) {
            Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, routeConfig);
        });

    }

    function findMatchingRequest(reqContext) {

        for (var i = 0; !reqContext.getPlaybackResponse() && i < Nocca.repositories.length; i++) {

            if (repositoryPlaybackEnabled[Nocca.repositories[i].name()]) {
                reqContext.setPlaybackResponse(Nocca.repositories[i].matchRequest(reqContext));
            }

        }
        
        return reqContext;
    }

    function listRepositories(apiReq) {

        apiReq.ok().end(_.map(Nocca.repositories, function (repo) {
            return {
                name: repo.name(),
                type: repo.type()
            };
        }));

    }

    function getRepositoryStatus(apiReq) {

        if (typeof repositoryPlaybackEnabled[apiReq.matches.repositoryKey] !== 'undefined') {
            apiReq.ok().end(repositoryPlaybackEnabled[apiReq.matches.repositoryKey]);
        }
        else {
            apiReq.notFound().end();
        }

    }
    
    function setRepositoryStatus(apiReq) {

        if (typeof repositoryPlaybackEnabled[apiReq.matches.repositoryKey] !== 'undefined') {

            $utils.readBody(apiReq.req).then(function (body) {
                body = JSON.parse(body);

                if(_.isBoolean(body)) {
                    repositoryPlaybackEnabled[apiReq.matches.repositoryKey] = body;
                    apiReq.ok().end(repositoryPlaybackEnabled[apiReq.matches.repositoryKey]);
                }
                else {
                    apiReq.badRequest().end('Status must be boolean');
                }
            }).fail(function () {
                apiReq.badRequest().end('Unable to read request');
            });

        }
        else {
            apiReq.notFound().end();
        }


    }

}
