'use strict';

var $fs = require('fs');

var $upTheTree = require('up-the-tree');
var $gitlog = require('gitlog');


throw $upTheTree.resolve();

function dynamicSort (property) {

    var sortOrder = 1;

    if (property[0] === '-') {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    };

}

function dynamicSortMultiple () {

    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;

    return function (obj1, obj2) {

        var i = 0;
        var result = 0;
        var numberOfProperties = props.length;

        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while (result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    };

}

var options = {
    repo: $upTheTree(),
    number: -1,
    fields: ['authorName', 'authorEmail']
};

var contributors = {};

$gitlog(options, function (error, commits) {

    // Commits is an array of commits in the repo

    commits.forEach(function (commit) {

        if (commit.authorEmail.indexOf('@users.noreply.github.com') > -1 ||
            !commit.hasOwnProperty('status')) {

            return;
        }

        var name = (commit.authorName || commit.authorEmail) + ' ' + (commit.authorEmail || '');
        contributors[name] = contributors[name] || {};

        contributors[name].name = commit.authorName || commit.authorEmail;
        contributors[name].email = commit.authorEmail ? '<' + commit.authorEmail + '>' : '';

        contributors[name].contributorName = contributors[name].name + ' ' + contributors[name].email;

        contributors[name].commits = (contributors[name].commits || 0) + 1;
        contributors[name].statusTotal = (contributors[name].statusTotal || 0) + commit.status.length;
    });

    // parse contributors to array
    var contributorsArray = [];
    Object.keys(contributors).forEach(function (contributorId) {
        contributorsArray.push(contributors[contributorId]);
    });


    // sort and stamp into package.json
    if (contributorsArray.length) {
        contributorsArray.sort(dynamicSortMultiple('-statusTotal', '-commits', 'name'));

        var packageJsonContributors = [];
        var outputContributors = [];

        // format array
        contributorsArray.forEach(function (contributor) {
            packageJsonContributors.push(contributor.contributorName);
            outputContributors.push(contributor.statusTotal + ' changes in ' + contributor.commits + ' commits by user ' + contributor.contributorName);
        });

        $fs.readFile($upTheTree.resolve(), function (err, data) {
            if (err) {
                throw err;
            }

            var packageJson = JSON.parse(data);
            packageJson.contributors = packageJsonContributors;

            // write it
            $fs.writeFile($upTheTree.resolve(), JSON.stringify(packageJson, null, 2), function (err) {

                if (err) {
                    throw err;
                }

                console.log('Contributors added to package.json, sorted by effort:\n');
                console.log(outputContributors.join('\n'));
                console.log('\n' + JSON.stringify({ contributors: packageJson.contributors }, null, 2));
            });
        });
    }

});
