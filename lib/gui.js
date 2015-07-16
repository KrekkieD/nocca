'use strict';

var $connect = require('connect');
var $serveStatic = require('serve-static');
var $wiredep = require('wiredep');

module.exports = gui;

function gui (Nocca) {

	var self = this;

	self.server = undefined;

    if (Nocca.getConfig('servers.gui.enabled', Nocca.config)) {

		self.server = $connect();

		self.server.use('/', function (req, res, next) {

			if (req.url === '/') {
				injectBowerComponents();
			}
			next();

		});
		self.server.use('/index.html', function (req, res, next) {

			if (req.url === '/') {
				injectBowerComponents();
			}
			next();

		});

		self.server.use($serveStatic(__dirname + '/../ui'));
		self.server.use($serveStatic(__dirname + '/../bower_components'));
		self.server.use('/noccaConfig.json', function (req, res) {
			res.writeHead(200, {});
			res.end(dumpConfig());
		});

		Nocca.getConfig('servers.gui.listen', Nocca.config, true)
			.then(function (config) {

				if (config !== false) {

					var args = [];

					config.port && args.push(config.port);
					config.hostname && args.push(config.hostname);

					args.push(function () {
						args.pop();
						Nocca.logSuccess(args.join(', '), '-- GUI');
					});

					self.server.listen.apply(self.server, args);

				}

			});

    }

	function injectBowerComponents () {

		var wiredepOptions = {
			src: __dirname + '/../ui/index.html',
			bowerJson: require(__dirname + '/../bower.json'),
			// DO NOT REMOVE __dirname as this is needed for installs through npm.
			// The path can vary, dummy!
			directory:  __dirname + '/../bower_components',
			// this ignore path makes it search in current folder (./),
			// fixing the context root path issues.
			ignorePath: '../bower_components/'
		};

		$wiredep(wiredepOptions);

	}

	function dumpConfig () {

		var uniqueObjects = [];

		var cleanedConfig = filterObj(Nocca.config, function (value) {

			if (typeof value !== 'function') {

				if (value instanceof Object) {

					for (var i = 0, iMax = uniqueObjects.length; i < iMax; i++) {
						if (uniqueObjects[i] === value) {
							return false;
						}
					}

					uniqueObjects.push(value);

				}

				return true;

			}

			return false;

		}, true);

		// extract all that's not a function
		return JSON.stringify(cleanedConfig, null, 4);

	}

	function filterObj (obj, filterFunction, recursive) {

		var cleanedObj = {};
		if (Array.isArray(obj)) {
			cleanedObj = [];
		}

		Object.keys(obj).forEach(function (key) {


			if (filterFunction(obj[key])) {

				if (recursive && obj[key] instanceof Object) {

					cleanedObj[key] = filterObj(obj[key], filterFunction, recursive);

				}
				else {
					cleanedObj[key] = obj[key];
				}

			}

		});

		return cleanedObj;

	}

}
