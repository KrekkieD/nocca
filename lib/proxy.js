'use strict';

var $express = require('express');

module.exports = Server;

function Server (Nocca) {

	var self = this;

	self.router = $express.Router();

	self.router.use(connectionHandler);

    function connectionHandler(req, res) {

        Nocca.logDebug('\nRequest: ' + req.url);

        var reqContext = Nocca.requestContextFactory.createInstance(req, res);

        // kick it!
        reqContext.start();

    }

}

