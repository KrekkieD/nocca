'use strict';

var $express = require('express');

module.exports = ProxyServer;

function ProxyServer (Nocca) {

    var self = this;

    self.logger = Nocca.logger.child({ module: 'ProxyServer' });

    self.router = $express.Router();

    self.router.use(connectionHandler);

    function connectionHandler (req, res) {

        self.logger.debug('Incoming request on proxy:' + req.url);

        var reqContext = Nocca.requestContextFactory.createInstance(req, res);

        // kick it!
        reqContext.start();

    }

}

