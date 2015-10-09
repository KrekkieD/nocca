'use strict';

var $path = require('path');
var $fs = require('fs');

var $q = require('q');
var $globby = require('globby');
var $browserify = require('browserify');


var projectTargetPath = './ui';


module.exports = browserify;

if (!module.parent) {
    console.log('Browserifying');
    browserify()
        .then(function () {
            console.log('Browserify done!');
        })
        .catch(function (err) {
            setTimeout(function () {
                throw err;
            }, 0);
        });
}

function browserify () {

    return $globby([
        './src/**/*.js',
        '!./**/*.spec.js'
    ]).then(function (files) {

        var b = $browserify({
            standalone: 'yes'
        });

        files.forEach(function (file) {
            // make sure file is not empty
            if ($fs.readFileSync(file).toString() !== '') {
                b.add(file);
            }
        });

        return $q.ninvoke(b, 'bundle')
            .then(function (buffer) {

                // add comments for coverage report
                var contents = buffer.toString();
                contents = '/* istanbul ignore next */' + contents;
                contents = contents.replace('(function(){var define,module,exports;return ',
                    '(function(){var define,module,exports;return /* istanbul ignore next */');

                return $q.nfcall($fs.writeFile, $path.resolve(projectTargetPath, 'bundle.js'), contents);

            });

    });

}
