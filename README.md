# nocca
Node mock server

![Feels good](http://i1.kym-cdn.com/photos/images/newsfeed/000/591/928/94f.png "Feels good")

## Installing

## Configuring

## Running

## Options

# Under the hood

## Request Promise Chains

* Server creates a Request Context for each incoming request
* ChainBuilderFactory sets up a series of promised operations
* Each step in this chain can assume the existence of certain properties on the request context
* Each step must record some of its actions in pre-defined properties on the request context
* A step is allowed to do more than what the interface requires

## Default Chain

