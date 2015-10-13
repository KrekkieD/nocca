# Nocca
Node mock server

![Feels good](http://i1.kym-cdn.com/photos/images/newsfeed/000/591/928/94f.png "Feels good")

## Description

Use Nocca to serve mocks instead of hitting actual backend servers. Useful for load testing, end-to-end testing, edge-case validations and when you're developing against an unfinished or under-development backend.

## Installing

Nocca can be installed and used as a NodeJS module. Simply run the following command:

```bash
$ npm install --save-dev nocca
```

## Running

```javascript
var $nocca = require('nocca');

var nocca = new $nocca({/* options */});
```

This will start the Nocca server on the port (and hostname) specified in the configuration. By default, it is running on localhost:8989. See below on how to configure your instance.

Nocca will start a number of servers:

- GUI (web application): `localhost:8989/gui`
- REST API (allows controlling the instance): `localhost:8989/httpApi`
- proxy server (responsible for handling your mock requests): `localhost:8989/proxy`
- websocket (feeds the GUI with realtime data): `localhost:8989/socket`

## Configuring your instance

For Nocca to work for your application you will need to add application specific configuration properties.

### Server settings

Where do you want the Nocca server to run?

```javascript
var $nocca = require('nocca');
var nocca = new $nocca({
    server: process.env.VCAP_APP_PORT || 8989
});
```

Provide a port number, or an array of arguments: `[portNumber, hostname, backlog]`. The array will be applied to the [`server.listen`](https://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback) function. Nocca will provide the callback argument.

By default it will use the Cloud Foundry port if set, or fall back to `8989`.

### Endpoints

A Nocca endpoint is a configuration object that is used to handle an incoming request on the Nocca proxy server (`localhost:8989/proxy/*` by default). The object may contain the endpoint URL of the target server, information on how to create a requestKey, set recording/forwarding flags, etc. 

By default Nocca is configured to use the `endpointSelector` plugin. This plugin uses the `options.endpoints` property to determine which endpoint should be used. Lets work with an example:

```javascript
var $nocca = require('nocca');
var nocca = new $nocca({
    endpoints: {
        google: {
            targetBaseUrl: 'https://www.google.com/com'
        },
        '/googly/ding': {
            targetBaseUrl: 'https://www.google.co.uk/co.uk'
        },
        '/googly/ding/dazzle': {
            targetBaseUrl: 'https://www.google.co.uk/co.uk'
        },
        _default: {
            targetBaseUrl: 'https://www.google.nl/nl'
        }
    }
});
```

#### Specifying endpoints

The endpoint key is used as matcher in the `endpointSelector`. An endpoint is selected based on the incoming request path:

1. First path part after `/proxy/`:
    - `http://localhost:8989/proxy/google/something` `->` `google`
    - Adds `/something` to `targetBaseUrl`
2. Starts with path:
    - `http://localhost:8989/proxy/googly/ding/dong` `->` `'/googly/ding'`
    - Adds `/dong` to `targetBaseUrl`
    - The longest matches endpoint key (`.length`) will be selected:
        - `http://localhost:8989/proxy/googly/ding/dazzle/doo` `->` `'/googly/ding/dazzle'`
        - Adds `/doo` to `targetBaseUrl`
3. Default
    - `http://localhost:8989/proxy/goggle/ding` `->` `'_default'`
    - Adds `/goggle/ding` to `targetBaseUrl`

The `targetBaseUrl` property defines the url that would serve the response. It is to forward the request to, when forwarding is enabled.

View or run `./examples/docs/config-endpoints.js` for an example of this configuration.

#### Overriding configuration for a specific endpoint

Each endpoint can set config properties for incoming requests on that endpoint. This is useful for properties like `keyGenerator`, `record`, `forward` and `responseDelay`.

```javascript
var $nocca = require('nocca');
var nocca = new $nocca({
    // global settings
    record: true,
    forward: true,

    endpoints: {
        google: {
            targetBaseUrl: 'https://www.google.com/com'
        },
        '/googly/ding': {
            // disable forwarding for this endpoint
            forward: false,
            targetBaseUrl: 'https://www.google.co.uk/co.uk'
        },
        _default: {
            // disable recording for this endpoint
            record: false,
            targetBaseUrl: 'https://www.google.nl/nl'
        }
    }
});
```

- The `/googly/ding` endpoint does not forward as it overrides the global `forward` setting
- The `_default` endpoint does not record as it overrides the global `record` setting

View or run `./examples/docs/overriding-endpoint-config.js` for an example of this configuration.


### Recording

To record you need to use a `cacheRepository`. See the Cache Repositories chapter for more information.

A cache repository can record the answers given on a request to Nocca. To determine whether caches should be recorded, use the `record` property:

```javascript
var $nocca = require('nocca');
var nocca = new $nocca({
    record: true
});
```

When `true` the response message (both when it's served from a cache and when it's returned from the endpoint server) will be recorded in all registered cache repositories. When `false` it won't be.

### Playback

To replay a cache response you need to use a `cacheRepository`. See the Cache Repositories chapter for more information.

A cache repository can replay the answers given on a request to Nocca. To determine whether caches should be played back, use the `playback` property:

```javascript
var $nocca = require('nocca');
var nocca = new $nocca({
    playback: true
});
```

When `true` the configured cache repositories will be queried in order of configuration to retrieve a cache for an incoming request. If a repository provides a cache, any remaining repositories will not be queried. 

When `false` the cache repositories will not be queried at all.

### Forwarding

To forward or prevent forwarding an incoming request to an endpoint server, you need to set the `forward` property.

This can be one of the following: `true`, `false`, `'missing'`.

```javascript
var $nocca = require('nocca');
var nocca = new $nocca({
    forward: true
});
```

When `true` any incoming request will be forwarded to the endpoint server. If a cache was previously retrieved using the `playback` property it will be discarded and replaced by the response from th endpoint server.

When `false` the request will never be forwarded.

When `'missing'` the request will only be forwarded when no cache response was found using the `playback` property.

### Cache Repositories

A response recorded or served by Nocca is called a `cache`. Each cache has a `requestKey` that identifies the cache and allows a cache to be selected as a response. More on request keys in a chapter below.

By default Nocca comes with two of these:

- `cacheConglomerate`
- `cacheQueue`

#### The cache conglomerate

Useful for: fixed responses, static sources, load test responses

- The cacheConglomerate can hold a list of caches and will continue responding to your requests with the cache that matches a calculated request key. 
- It cannot contain duplicate request keys. 
- Additional requests will serve the same cache. 
- As request keys are unique, the order of the caches does not matter.
- The cacheConglomerate will not run out of caches as caches are not removed from the list.

##### HTTP API

You can use the HTTP API to control the repository:

- `GET:/httpApi/plugins/cacheConglomerate/caches`
    - Retrieve the current list of stored caches
- `DELETE:/httpApi/plugins/cacheConglomerate/caches`
    - Empty the current list of stored caches
- `POST:/httpApi/plugins/cacheConglomerate/caches`
    - Add provided list of caches to the current list of stored caches
- `PUT:/httpApi/plugins/cacheConglomerate/caches`
    - Replace the current list of stored caches with provided list
- `GET:/httpApi/plugins/cacheConglomerate/recorded-caches`
    - Get the current list of recorded caches

#### The cache queue

Useful for: repeated requests with different responses, end to end scenarios (i.e. get profile request, change profile request, get profile request). 

- The cacheQueue can hold a list of caches and serves them in order. 
- After a cache is served it is removed from the list and will not be served again. 
- It can contain duplicate request keys. Additional requests will serve the next cache that matches the request key. 
- The order of the caches determines the order in which they are served: it will serve the first cache that matches the request key. 
- The cacheQueue can run out of caches to serve.

##### HTTP API

You can use the HTTP API to control the repository:

- `GET:/httpApi/plugins/cacheQueue/caches`
    - Retrieve the current list of stored caches
- `DELETE:/httpApi/plugins/cacheQueue/caches`
    - Empty the current list of stored caches
- `PUT:/httpApi/plugins/cacheQueue/caches`
    - Replace the current list of stored caches with provided list
- `GET:/httpApi/plugins/cacheQueue/recorded-caches`
    - Get the current list of recorded caches

### Request keys

A request key is generated by a `keyGenerator`. Nocca is preconfigured with the `cherryPickingKeygen`. 

See its dedicated [documentation file](docs/plugins/cherryPickingKeygen.md).

### Delaying responses

To delay a response you need a `responseDelay` plugin. Nocca is preconfigured with the `distributedDelay` module.

See its dedicated [documentation file](docs/plugins/distributedDelay.md).

### Transforming requests and responses

To transform the contents of a request or response you need a `messageTransformer`. This can be useful to patch timestamps in a cache. Nocca includes a `simpleMessageTransformer` module. 

See its dedicated [documentation file](docs/plugins/simpleMessageTransformer.md).

### Log settings

Nocca is configured with a Bunyan logger that logs to your console. You can change the application name and log level. The level of logging should be one of: `fatal`, `error`, `warn`, `info`, `debug`, `trace`. The logger will log that level and higher (i.e. 'info' would also log 'error' events, but not 'debug' events).

```javascript
var $nocca = require('nocca');
var nocca = new $nocca({
    logger: {
        name: 'Nocca',
        level: 'info'
    },
});
```

# Under the hood

## Flow

![Nocca request flow](docs/flow.png "Nocca request flow")
