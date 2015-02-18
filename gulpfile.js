// // Caveat emptor
// =============
//
// This file has been generated, and can be overwritten.
// If you thing something's wrong with this file, please
// visit bower.repositoryUrl and submit a pull
// request, contact the maintainer or file a bug.
'use strict';

var _ = require('lodash'),
	angularFilesort = require('gulp-angular-filesort'),
	concat = require('gulp-concat'),
	csslint = require('gulp-csslint'),
	del = require('del'),
	es = require('event-stream'),
	singleConnect = require('gulp-connect'),
	bowerFiles = require('main-bower-files'),
	browserSync = require('browser-sync'),
	connect = require('gulp-connect-multi'),
	extend = require('extend'),
	fs = require('fs'),
	ghelp = require('gulp-showhelp'),
	globule = require('globule'),
	gulp = require('gulp'),
	gutil = require('gulp-util'),
	file = require('gulp-file'),
	inject = require('gulp-inject'),
	jshint = require('gulp-jshint'),
	karma = require('gulp-karma'),
	minifyHtml = require('gulp-minify-html'),
	minimist = require('minimist'),
	modRewrite = require('connect-modrewrite'),
	ngAnnotate = require('gulp-ng-annotate'),
	rimraf = require('rimraf'),
	path = require('path'),
	plumber = require('gulp-plumber'),
	prettify = require('gulp-jsbeautifier'),
	protractor = require('gulp-protractor')
	.protractor,
	sass = require('gulp-sass'),
	seq = require('gulp-sequence')
	.use(gulp),
	symlink = require('gulp-symlink'),
	tap = require('gulp-tap'),
	template = require('gulp-template'),
	templateCache = require('gulp-angular-templatecache'),
	uglify = require('gulp-uglify'),
	watch = require('gulp-watch');

var generator = require('./generator.json');
var rewrites = [];

/**
 * [settings Settings]
 * @type {Object}
 */
var settings = {
	staticAssetTypes: ['js', 'css'],
	uglify: {},
	ngAnnotate: {
		add: true,
		remove: true,
		single_quotes: true
	}
};

/**
 * [paths Directory mappings]
 * @type {Object}
 */
var paths = {
	js: {
		src: generator.srcDir,
		dev: 'target/dev/app',
		dist: './target/dist/app'
	},
	bootstrap: {
		src: 'src/',
		dev: 'target/dev/app',
		dist: 'target/dist'
	},
	scss: {
		src: 'src',
		dev: 'target/dev'
	},
	fonts: {
		src: './src/fonts/**/*'
	},
	templates: {
		app: {
			src: 'src',
			dist: 'target/dist/app'
		}
	}
};

// Globs
/**
 * [globs Glob mappings]
 * @type {Object}
 */
var globs = {
	js: {
		src: paths.js.src + '/**/!(*spec|*scenario).js',
		dev: paths.js.dev + '/**/*.js'
	},
	scss: {
		src: paths.scss.src + '/**/*.scss',
		dev: paths.scss.dev + '/**/*.css'
	},
	spec: {
		src: paths.js.src + '/**/*spec.js',
	},
	bootstrap: {
		src: paths.bootstrap.src + '/bootstrap.js',
		dev: paths.bootstrap.dev + '/bootstrap.js',
		dist: paths.bootstrap.dist + '/bootstrap.js'
	},
	templates: {
		app: {
			src: paths.templates.app.src + '/**/!(*index).html'
		}
	}
};


// pass arguments
var cliOptions = {
	string: ['host', 'rewrite-host'],
	default: {
		host: 'localhost'
	}
};


// Spike 'em with argv
settings = extend(settings, minimist(process.argv.slice(2), cliOptions));

var devServer = connect(),
	coverageServer = connect(),
	jasmineServer = connect();

if (generator) {


	if (!generator.name) {
		throw new Error('generator.name entry in generator.json missing');
	}

	if (!generator.name.full) {
		throw new Error('generator.name.full entry in generator.json missing');
	}
	if (!generator.name.slug) {
		throw new Error('generator.name.slug entry in generator.json missing');
	}
	if (!generator.bootstrap) {
		throw new Error('generator.bootstrap entry in generator.json missing');
	}
	if (!generator.bootstrap.module) {
		throw new Error(
			'generator.bootstrap.module entry in generator.json missing');
	}

	if (!generator.excludes) {
		generator.excludes = {};
	}

	if (generator.server) {
		if (generator.server.rewrites && generator.server.rewrites.templates) {
			var rewriteCliOptions = {};
			if (settings['rewrite-host']) {
				rewriteCliOptions.host = settings['rewrite-host'];
			}
			var rewriteDefaults = extend({}, (generator.server.rewrites.defaults || {}),
				rewriteCliOptions);
			rewrites = generator.server.rewrites.templates.map(function (template) {
				return _.template(template)(rewriteDefaults);
			});
		}
	}
} else {
	throw new Error('Missing generator.json file');
}


gulp.task('help', function () {
		ghelp.show();
	})
	.help = 'shows this help message.';

// kicks off local coverage and dev servers
// will both open in new browser window

gulp.task('serve', function (done) {
		seq(
			'clean', 'clean-caches', [
				'dev-bootstrap',
				'dev-jshint',
				'dev-js',
				'dev-partials',
				'dev-scss'
			], [
				'dev-js-template',
				'dev-js-config-run-template', 'dev-js-bootstrap-template',
				'dev-bower-js-template',
				'dev-bower-css-template',
				'dev-css-template'
			],
			'assemble-index',
			'karma',
			'create-phantom-coverage-symlink',
			'dev-server',
			'dev-browsersync',
			'dev-coverage-server',
			'dev-jasmine-server', [
				'watch-bootstrap',
				'watch-js',
				'watch-spec',
				'watch-partials',
				'watch-scss',
				'watch-index-parts'
			]
		)(done);
	})
	.help = {
		'': 'Run the CI environment',
		'--host=localhost': 'Set host domain for local servers, defaults to localhost'
	};

gulp.task('package', function (done) {
		// clean dist
		// include bootstrap?
		seq('dist-partials', 'dist-js', 'dist-modules', 'dist-all-modules',
			'dist-bootstrap',
			'dist-all-modules-with-bootstrap',
			done);
	})
	.help = 'Package for production';

gulp.task('dev-protractor', [
		'dev-protractor-server'
	], function (cb) {
		gulp.src('src/**/*scenario.js')
			.pipe(protractor({
				configFile: 'protractor.conf.js',
				args: []
			}))
			.on('error', function (err) {
				throw err;
			})
			.on('end', function () {
				singleConnect.serverClose();
				cb();
			});
	})
	.help = 'Run e2e tests with protractor';

gulp.task('dev-protractor-server', function () {
	singleConnect.server({
		root: ['target/dev', 'bower_components', 'test/mock/'],
		port: 8885
	});
});

// runs tests and copies reports for usage in bamboo
gulp.task('test', function (done) {
		seq('clean-reports', 'karma', 'create-phantom-coverage-symlink', done);
	})
	.help = 'Run tests with karma';

// housekeeping
gulp.task('clean', function (done) {
		rimraf('./target', function () {
			rimraf('./.tmp', function () {
				done();
			});
		});
	})
	.help = 'Clean ./target directory';

gulp.task('clean-caches', function (done) {
		rimraf('./.cache', function () {
			done();
		});
	})
	.help = 'Clean caches';

gulp.task('clean-reports', function (done) {
		rimraf('./target/reports', function () {
			done();
		});
	})
	.help = 'Clean reports';


gulp.task('clean-jshint', function (done) {
		del('./target/jshint*', function () {
			done();
		});
	})
	.help = 'Clean jshint';

// Testing
gulp.task('karma', function (done) {


		var wiredep = require('wiredep');
		var bowerDependencies = wiredep({
			devDependencies: true
		});
		var bowerFiles = bowerDependencies.js;


		// Why first exclude conf and run files and later include em?
		// Because it affects the loading order of files for the karma preprocessor
		var files = bowerFiles
			.concat(['./' + generator.srcDir + '/**/!(*bootstrap|config|run|scenario).js',
				'./target/dev/app/**/*templates.js',
				'./' + generator.srcDir + '/**/*config.js', './src/**/*run.js',
				'./' + generator.srcDir + '/**/*spec.js'
			]);

		gulp.src(files)
			.pipe(karma({
				configFile: __dirname + '/karma.conf.js',
				action: 'run'
			}))
			.on('error', function () {
				// Make sure failed tests cause gulp to exit non-zero
				done();
			})
			.on('end', function () {
				done();
			});

	})
	.help = 'Run karma';

gulp.task('create-phantom-coverage-symlink', function () {
		return gulp.src('*phantom*.info', {
				cwd: 'target'
			})
			.pipe(symlink('target/reports/karma-coverage/sonar/lcov.info'));
	})
	.help = 'Create lcov symlink for Sonar';


gulp.task('dev-js', function () {
	return gulp.src(globs.js.src)
		.pipe(plumber())
		.pipe(ngAnnotate(settings.ngAnnotate))
		.pipe(gulp.dest(paths.js.dev));
});


gulp.task('dev-jshint', function () {
	return gulp.src(globs.js.src)
		.pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-summary', {
			verbose: true,
			reasonCol: 'cyan,bold'
		}))
		.pipe(jshint.reporter('gulp-jshint-file-reporter', {
			filename: './target/jshint-output.log'
		}))
		.pipe(jshint.reporter('gulp-jshint-html-reporter', {
			filename: './target/jshint-output.html'
		}));
});

gulp.task('dev-bootstrap', function () {
	return gulp.src(globs.bootstrap.src)
		.pipe(template({
			generator: generator
		}))
		.pipe(gulp.dest(paths.bootstrap.dev));
});

gulp.task('dev-bower-js-template', function () {
	return file('bower.js.tmpl', '<!-- bower:js --><!-- endinject -->', {
			src: true
		})
		.pipe(inject(gulp.src(bowerFiles(), {
			read: false
		}), {
			name: 'bower',
			ignorePath: '/bower_components'
		}))
		.pipe(gulp.dest('./.tmp'));
});
gulp.task('dev-bower-css-template', function () {
	return file('bower.css.tmpl', '<!-- bower:css --><!-- endinject -->', {
			src: true
		})
		.pipe(inject(gulp.src(bowerFiles(), {
			read: false
		}), {
			name: 'bower',
			ignorePath: '/bower_components'
		}))
		.pipe(gulp.dest('./.tmp'));
});

gulp.task('dev-partials', function () {
	var streams = globule.find('./src/app/*')
		.map(function (file) {
			var moduleDirName = path.basename(file);
			var moduleName = generator.prefix + '.' + moduleDirName;

			return gulp.src('./src/app/' + moduleDirName + '/*.html')
				.pipe(minifyHtml({
					empty: true,
					quotes: true,
					loose: true
				}))
				.pipe(templateCache(moduleDirName + '.templates.js', {
					module: moduleName
				}))
				.pipe(gulp.dest('./target/dev/app/' + moduleDirName));
		});
	return es.merge.apply(null, streams);
});


gulp.task('dev-scss', function () {
	return gulp.src(globs.scss.src)
		.pipe(sass())
		.pipe(gulp.dest(paths.scss.dev))
		.pipe(csslint())
		.pipe(csslint.reporter());
});


gulp.task('dev-js-template', function () {
	return file('app.js.tmpl', '<!-- inject:js --><!-- endinject -->', {
			src: true
		})
		.pipe(inject(
			gulp.src('target/dev/**/!(*bootstrap|*config|*run).js')
			.pipe(angularFilesort()), {
				ignorePath: '/target/dev/',
				whitelist: [
					'./src/**/!(*config|*run).js'
				]
			}))
		.pipe(gulp.dest('./.tmp'));
});

gulp.task('dev-js-config-run-template', function () {
	return file('app.jsConfigAndRun.tmpl',
			'<!-- inject:js --><!-- endinject -->', {
				src: true
			})
		.pipe(inject(
			gulp.src(['target/dev/**/*config.js', 'target/dev/**/*run.js']), {
				ignorePath: '/target/dev/'
			}
		))
		.pipe(gulp.dest('./.tmp'));
});

gulp.task('dev-js-bootstrap-template', function () {
	return file('app.jsBootstrap.tmpl',
			'<!-- inject:js --><!-- endinject -->', {
				src: true
			})
		.pipe(inject(
			gulp.src(['target/dev/**/*bootstrap.js']), {
				ignorePath: '/target/dev/'
			}
		))
		.pipe(gulp.dest('./.tmp'));
});

gulp.task('dev-css-template', function () {
	return file('app.css.tmpl', '<!-- inject:css --><!-- endinject -->', {
			src: true
		})
		.pipe(inject(gulp.src(globs.scss.dev), {
			ignorePath: '/target/dev/'
		}))
		.pipe(gulp.dest('./.tmp'));
});

gulp.task('assemble-index', function () {
	var data = extend({}, {
		generator: generator,
		inject: {}
	});
	globule.find('./.tmp/*.tmpl')
		.map(function (file) {
			var value = fs.readFileSync(file, 'utf8');
			var key = path.basename(file, '.tmpl');
			var parts = key.split('.');
			if (parts.length > 1) {
				key = parts[0];
				var part = data.inject[key] ? data.inject[key] : {};
				part[parts[1]] = value;
				value = part;
			}

			data.inject[key] = value;
		});
	gulp.src('./src/index.html')
		.pipe(template(data))
		.pipe(prettify())
		.pipe(gulp.dest('./target/dev/'));
});

gulp.task('watch-js', function () {
	watch([globs.js.src, globs.spec.src, './.tmp/.freak/**/*'], {
		debounceDelay: 1000
	}, function (files, done) {
		seq('clean-jshint', 'dev-jshint', 'dev-js', 'dev-js-template',
			'dev-js-config-run-template',
			'dev-js-bootstrap-template', 'karma',
			'create-phantom-coverage-symlink',
			function () {
				done();
			});
	});
});

gulp.task('watch-spec', function () {
	watch(globs.spec.src, function (files, done) {
		seq('karma', 'create-phantom-coverage-symlink', done);
	});
});

gulp.task('watch-bootstrap', function () {
	watch(globs.bootstrap.src, function (files, done) {
		seq('dev-bootstrap', 'dev-js-template', 'dev-js-config-run-template',
			'dev-js-bootstrap-template',
			done);
	});
});

gulp.task('watch-partials', function () {
	watch([globs.templates.app.src, './src/app/.freak/partials'], function (
		files,
		done) {
		seq('dev-partials', 'dev-js-template', done);
	});
});

gulp.task('watch-scss', function () {
	watch(globs.scss.src, function (files, done) {
		seq('dev-scss', 'dev-css-template', done);
	});
});

gulp.task('watch-index-parts', function () {
	watch(['bower.json', 'src/index.html', './.tmp/*.tmpl'], function (files,
		done) {
		seq('dev-bower-js-template',
			'dev-bower-css-template', 'assemble-index', done);
	});
});

gulp.task('dev-server', devServer.server({
	root: ['target/dev', 'bower_components', 'test/mock/', '.cache'],
	port: 8887,
	livereload: false,
	middleware: function () {
		return [
			modRewrite(rewrites)
		];
	}
}));

gulp.task('dev-browsersync', function () {
	browserSync({
		host: settings.host,
		port: 3001,
		files: 'target/dev/**',
		proxy: settings.host + ':8887',
		open: false
	});
});

gulp.task('dev-coverage-server', coverageServer.server({
	root: ['target/reports/karma-coverage/lcov-report'],
	host: settings.host,
	port: 8888,
	livereload: false
}));

gulp.task('dev-jasmine-server', jasmineServer.server({
	root: ['target/reports/jasmine'],
	host: settings.host,
	port: 8886,
	livereload: false
}));

gulp.task('dev-coverage-browsersync', function () {
	browserSync({
		host: settings.host,
		port: 3010,
		files: 'target/reports/karma-coverage/lcov-report/**/*',
		proxy: settings.host + ':8888',
		reloadDelay: 2000,
		open: false
	});
});

// Package
gulp.task('dist-templates', function () {
	return gulp.src(paths.templates.app.src)
		.pipe(minifyHtml({
			empty: true,
			quotes: true,
			loose: true
		}))
		.pipe(templateCache(generator.bootstrap.module + '.templates.js', {
			module: generator.bootstrap.module
		}))
		.pipe(gulp.dest(paths.templates.app.dist));
});

gulp.task('dist-partials', function () {
	var streams = globule.find('./src/app/*')
		.map(function (file) {
			var moduleDirName = path.basename(file);
			var moduleName = generator.prefix + '.' + moduleDirName;

			return gulp.src('./src/app/' + moduleDirName + '/*.html')
				.pipe(minifyHtml({
					empty: true,
					quotes: true,
					loose: true
				}))
				.pipe(templateCache(moduleDirName + '.templates.js', {
					module: moduleName
				}))
				.pipe(gulp.dest('./target/dist/app/' + moduleDirName));
		});
	return es.merge.apply(null, streams);
});

gulp.task('dist-js', function () {
	return gulp.src(globs.js.src)
		.pipe(ngAnnotate(settings.ngAnnotate))
		.pipe(angularFilesort())
		.pipe(gulp.dest(paths.js.dist));
});

gulp.task('dist-modules', function () {
	var streams = globule.find(paths.js.dist + '/*')
		.filter(function (file) {
			return fs.lstatSync(file)
				.isDirectory();
		})
		.map(function (file) {

			var moduleDirName = path.basename(file);
			var moduleName = generator.prefix + '.' + moduleDirName;

			return gulp.src(paths.js.dist + '/' + moduleDirName + '/*.js')
				.pipe(angularFilesort())
				.pipe(uglify(settings.uglify))
				.pipe(concat(moduleName + '.js'))
				.pipe(gulp.dest('./target/dist/modules'));

		});
	return es.merge.apply(null, streams);
});

gulp.task('dist-all-modules', function () {
	return gulp.src('./target/dist/modules/*')
		.pipe(angularFilesort())
		.pipe(concat('modules.js'))
		.pipe(gulp.dest('./target/dist'));
});

gulp.task('dist-bootstrap', function () {
	return gulp.src(globs.bootstrap.src)
		.pipe(template({
			generator: generator
		}))
		.pipe(uglify(settings.uglify))
		.pipe(gulp.dest(paths.bootstrap.dist));
});

gulp.task('dist-all-modules-with-bootstrap', function () {
	return gulp.src('./target/dist/*.js')
		.pipe(concat('modules-bootstrapped.js'))
		.pipe(gulp.dest('./target/dist'));
});


///////////////////////
///
