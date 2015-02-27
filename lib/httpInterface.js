'use strict';

var $websocket = require(__dirname + '/httpInterface/websocket');
var $webserver = require(__dirname + '/httpInterface/webserver');

var $http = require('http');

module.exports = HttpInterface;

function HttpInterface (Nocca) {

    var self = this;

    self.broadcast = broadcast;

    // TODO: add these members to Nocca instance?
    self.httpApi = undefined;
    self.websocketServer = undefined;

    if (Nocca.config.servers.httpApi.enabled === true) {

        self.httpApi = new $webserver(Nocca);
        Nocca.config.servers.httpApi.server = self.httpApi.server;

    }
    else {
        // if there's no httpApi, make sure the websocketServer config does not reuse the httpApi
        // Because it's not there, you see?

        // only makes sense if websockets are enabled
        if (Nocca.config.servers.websocketServer.useHttpApiServer === true &&
            Nocca.config.servers.websocketServer.enabled === true) {

            Nocca.config.servers.websocketServer.useHttpApiServer = false;
            // let's bitch about it
            Nocca.warn('Cannot re-use httpApiServer for websocketServer because httpApi is disabled!');
        }

    }

    if (Nocca.config.servers.websocketServer.enabled === true) {

        if (Nocca.config.servers.websocketServer.useHttpApiServer === true) {
            delete Nocca.config.servers.websocketServer.port;
            Nocca.config.servers.websocketServer.httpServer = Nocca.config.servers.httpApi.server;
        }
        else {
            // create a server
            var onTheFlyServer = $http.createServer(function (req, res) { res.end(); });
            onTheFlyServer.listen(Nocca.config.servers.websocketServer.port, function () {
                Nocca.log('WebsocketServer listening on port ' + Nocca.config.servers.websocketServer.port);
            });
            // add the server to the websocket config
            Nocca.config.servers.websocketServer.httpServer = onTheFlyServer;
        }

        self.websocketServer = new $websocket(Nocca);

        // on connect, share current state (full broadcast would be pointless)
        self.websocketServer.server.on('connect', function (webSocketConnection) {

            self.websocketServer.sendToConnection(
                webSocketConnection,
                Nocca.config.statistics.exporter()
            );

        });

    }

    function broadcast (data) {

        self.websocketServer.broadcast(data);

    }

}
