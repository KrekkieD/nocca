'use strict';

var $http = require('http');

var $express = require('express');

var $gui = require('./gui');
var $httpApi = require('./httpApi');
var $websocketServer = require('./websocketServer');
var $proxy = require('./proxy');

module.exports = WrapperServer;

function WrapperServer (Nocca) {

    var self = this;

    self.server = $http.createServer();

    self.logger = Nocca.logger.child({ module: 'WrapperServer' });

    self.app = $express();

    self.guiServer = new $gui(Nocca).router;
    self.proxyServer = new $proxy(Nocca).router;
    self.httpApiServer = new $httpApi(Nocca).router;
    self.websocketServer = new $websocketServer(Nocca, self.server);

    // wait for all config to have rendered before continuing
    Nocca.pubsub.subscribe(Nocca.constants.PUBSUB_NOCCA_INITIALIZE_PLUGIN, init);

    function init () {

        self.server.on('request', self.app);

        self.app.use('/gui', self.guiServer);

        self.app.use('/proxy', self.proxyServer);

        self.app.use('/http-api', self.httpApiServer);


        var listenArgs = Nocca.config.server;

        if (!Array.isArray(listenArgs)) {
            listenArgs = [listenArgs];
        }

        listenArgs.push(function (err) {

            if (err) {
                throw err;
            }

            self.logger.info('Listening on', self.server.address().port);

        });

        self.server.listen.apply(self.server, listenArgs);

    }

}
