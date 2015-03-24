# nocca
Node mock server

![Feels good](http://i1.kym-cdn.com/photos/images/newsfeed/000/591/928/94f.png "Feels good")

## Installing

Nocca can be installed and used as a NodeJS module. Simply run the following command:

```bash
npm install nocca
```

Then include it into your source file and you're ready to go:

```javascript
var Nocca = require('nocca');
```

## Configuring

Nocca has a default configuration that sets up basically everything you need to start recording, forwarding and replaying HTTP
calls. In the current version, all you need is to add endpoints to the configuration and think about generating keys for
 incoming requests.

The following table shows the possible configuration items Nocca supports, their default values and how you can override them.

<!-- TODO: Do we want to use anything like Bootstrap or other CSS-stuff for styling this document? -->
<table class="table table-properties">
  <tr class="header-row">
    <th>Property</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>logger</code></td>
    <td class="default-value-cell"><code>Nocca.$logger</code></td>
    <td class="description-cell">
      The <code>logger</code> service exposes a top-level logging function and series of log-level functions on which Nocca reports its activities. These functions
      are expected on the configured <code>logger</code> service:
      <ul>
        <li><code>logger(...)</code></li>
        <li><code>logger.debug(...)</code></li>
        <li><code>logger.disabled(...)</code></li>
        <li><code>logger.error(...)</code></li>
        <li><code>logger.info(...)</code></li>
        <li><code>logger.success(...)</code></li>
        <li><code>logger.warning(...)</code></li>
      </ul>
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>delay</code></td>
    <td class="default-value-cell"><code>500</code></td>
    <td class="description-cell">
      The default delay used when responding to HTTP requests. Even if there is a recorded response, Nocca will wait this long before sending the response.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>endpoints</code></td>
    <td class="default-value-cell"><code>{}</code></td>
    <td class="description-cell">
      The cache endpoints provided by Nocca. TODO: elaborate, since this is the heart of Nocca :)
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>servers</code></td>
    <td class="default-value-cell"><code>Object</code></td>
    <td class="description-cell">
      Contains configurations for all ports Nocca should open on startup. The defaul configuration contains three sub-entries, describing
      the different ports opened: <code>proxy</code>, <code>gui</code> and <code>httpApi</code>.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>servers.proxy</code></td>
    <td class="default-value-cell"><code>Object</code></td>
    <td class="description-cell">
      Configures the default proxy instance. Although the constructor function instantiating this server is overridable, you should take
      great care when doing so. Try not to break it ;)
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>servers.proxy.enabled</code></td>
    <td class="default-value-cell"><code>true</code></td>
    <td class="description-cell">
      If for some reason you do not want to open the actual proxy port, you can turn it off here. Caches and scenarios will still be loaded
      and can be accessed through the GUI and API, provided they are enabled. Another practical reason to do this is if you want to host the
      GUI on a different machine from the actual proxy.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>servers.proxy.instance</code></td>
    <td class="default-value-cell"><code>Nocca.$server</code></td>
    <td class="description-cell">
      Constructor function for the proxy server. This function should open the port and initialize the server component to begin receiving
      requests. <strong>If you override this, make sure you know what you are doing.</strong>
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>servers.proxy.port</code></td>
    <td class="default-value-cell"><code>3003</code></td>
    <td class="description-cell">
      This is the port the proxy will be listening to.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>gui</code></td>
    <td class="default-value-cell"><code>Object</code></td>
    <td class="description-cell">
      Configures an HTTP server to serve the Nocca user interface.
    </td>
  <tr class="property-row">
    <td class="property-cell"><code>gui.enabled</code></td>
    <td class="default-value-cell"><code>true</code></td>
    <td class="description-cell">
      Whether you want the GUI port to be enabled on this instance. Turning this off might be useful if you want to push Nocca's performance to the max, or you want to split the
      proxy and gui over two different servers.
    </td>
  <tr class="property-row">
    <td class="property-cell"><code>gui.instance</code></td>
    <td class="default-value-cell"><code>Nocca.$gui</code></td>
    <td class="description-cell">
      Constructor function for the GUI server. This function should open the port and initialize the server component to serve the GUI to user. If you want to be brave and creative
      and expand on the default user interface, you can override this function.
    </td>
  <tr class="property-row">
    <td class="property-cell"><code>gui.port</code></td>
    <td class="default-value-cell"><code>3004</code></td>
    <td class="description-cell">
      This is the port where the GUI server will be listening to.
    </td>
  <tr class="property-row">
    <td class="property-cell"><code>httpApi</code></td>
    <td class="default-value-cell"><code>Object</code></td>
    <td class="description-cell">
      Configures the REST API for controlling Nocca remotely.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>httpApi.enabled</code></td>
    <td class="default-value-cell"><code>true</code></td>
    <td class="description-cell">
      Allows you to disable the REST api if you do not wish the Nocca instance to be controlled remotely.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>httpApi.instance</code></td>
    <td class="default-value-cell"><code>Nocca.$httpApi</code></td>
    <td class="description-cell">
      Constructor function for the REST api server. This function should open the port and initialize the server component to serve the REST api to any consumers. Be very very careful
      overriding this :)
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>httpApi.port</code></td>
    <td class="default-value-cell"><code>3005</code></td>
    <td class="description-cell">
      This is the port where the REST api server will be listening to.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>websocketServer</code></td>
    <td class="default-value-cell"><code>Object</code></td>
    <td class="description-cell">
      Configures the WebSocket for receiving Nocca push updates.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>websocketServer.autoAcceptConnections</code></td>
    <td class="default-value-cell"><code>true</code></td>
    <td class="description-cell">
      Configures whether the Websocket library should automatically accept all requests coming in on the Websocket port. If you want to add access control to this port, you'll have
      to set this to <code>false</code>
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>websocketServer.enabled</code></td>
    <td class="default-value-cell"><code>true</code></td>
    <td class="description-cell">
      placeholder
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>websocketServer.instance</code></td>
    <td class="default-value-cell"><code>Nocca.$websocketServer</code></td>
    <td class="description-cell">
      Constructor function for the WebSocket server. This function should open the port and initialize the server to start listening
      to push events from the Nocca server instance.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>websocketServer.port</code></td>
    <td class="default-value-cell"><code>3005</code></td>
    <td class="description-cell">
      The port which will be used to open a new server if the option <code>useHttpApiServer</code> has been set to <code>false</code>.
      If that option is set to <code>true</code>, this component will latch onto the <code>httpApi</code> server to handle WebSocket
      over the same port.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>record</code></td>
    <td class="default-value-cell"><code>true</code></td>
    <td class="description-cell">
      Determines whether newly forwarded requests (and their accompanying responses) will be recorded.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>forward</code></td>
    <td class="default-value-cell"><code>$constants.FORWARDING_FORWARD_MISSING</code></td>
    <td class="description-cell">
      Determines whether requests should be forwarded to the target system. This option supports three values:
      <dl>
        <dt><code>true</code></dt>
        <dd>Indicates all requests should be forwarded and recorded responses should be ignored.</dd>
        <dt><code>$constants.FORWARDING_FORWARD_MISSING</code></dt>
        <dd>Indicates only requests for which no matching recorded responses are present should be forwarded. All matching requests will be played from caches and/or scenarios.</dd>
        <dt><code>false</code><dt>
        <dd>Indicates no requests will be forwarded. Only matching requests will be played from the caches and/or scenarios.</dd>
      </dl>
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>requestContextConstructor</code></td>
    <td class="default-value-cell"><code>RequestContext</code></td>
    <td class="description-cell">
      Constructor function for creating <code>RequestContext</code> objects. If you wish to use a subclass of the <code>RequestContext</code>, you
      can substitute your own constructor function for the default version.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>requestExtractor</code></td>
    <td class="default-value-cell"><code>Nocca.$requestExtractor</code></td>
    <td class="description-cell">
      Nocca plugin initializer function which returns a function capable of extracting responses from a RequestContext. In the default chain,
      this component is responsible for decorating the request context with a property <code>request</code>, containing <code>url</code>, <code>method</code>,
      <code>path</code> and <code>headers</code> objects.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>endpointManager</code></td>
    <td class="default-value-cell"><code>Nocca.$endpoints</code></td>
    <td class="description-cell">
      Nocca plugin initializer function which returns exposes the default <code>endpointSelector</code> service.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>keyGenerator</code></td>
    <td class="default-value-cell"><code>Nocca.$keys.defaultGenerator</code></td>
    <td class="description-cell">
      Request key generator used by default for incoming requests. This can be overridden per endpoint, provided the <code>allowEndpointOverrides</code>
      configuration directive is set to <code>true</code>. Nocca's default keygenerator is called <code>requestWithoutBodyKeyGenerator</code> and includes
      url, method and headers into the calculation of the request key.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>cacheentries</code></td>
    <td class="default-value-cell"><code>Object</code></td>
    <td class="description-cell">
      Configures several services related to the cacheentries of recorded cache entries and scenarios.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>cacheentries.exporter</code></td>
    <td class="default-value-cell"><code>Nocca.$cacheEntryRepository.exportRecordings</code></td>
    <td class="description-cell">
      Function used to retrieve stored cache entries. This function should accept zero or two parameters. If no parameters are supplied, it should
      return a complete map of all available cache entries, grouped by endpoint key and then request key. If two parameters are supplied, the first
      one is interpreted as an endpoint key, the second one as a request key:

      <ul>
        <li><code>function ([endpointKey, requestKey])</code></li>
      </ul>
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>cacheentries.matcher</code></td>
    <td class="default-value-cell"><code>Nocca.$cacheEntryRepository.defaultRequestMather</code></td>
    <td class="description-cell">
      Request chain function used to find a recorded response matching the incoming request. The default function will prefer matching scenarios of
      single cache entries. If operates on the <code>RequestContext</code> and is expected to add a property <code>cacheentriesResponse</code> containing
      the matching recorded response.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>cacheentries.mocker</code></td>
    <td class="default-value-cell"><code>Nocca.$recorder.simpleResponseRecorder</code></td>
    <td class="description-cell">
      Request chain function used to turn the forwarded response into a mock that can be saved to either a single cache or a scenario. It should
      offer the created mock entry to <code>Nocca.config.cacheentries.recorder</code> for storage and activation.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>cacheentries.recorder</code></td>
    <td class="default-value-cell"><code>Nocca.$cacheEntryRepository.addRecording</code></td>
    <td class="description-cell">
      Service function used to store a single mock entry in the cache database.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>cacheentries.scenarioExporter</code></td>
    <td class="default-value-cell"><code>Nocca.$cacheEntryRepository.exportScenarios</code></td>
    <td class="description-cell">
      Function used to retrieve scenarios. It can be called with zero or one argument. When no argument is specified, the
      function will return the complete set of all scenarios currently stored. When an argument is specified, it will be
      interpreted as the scenario key and only a single scenario will be returned.

      <ul>
        <li><code>function([scenarioKey])</code></li>
      </ul>
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>cacheentries.scenarioRecorder</code></td>
    <td class="default-value-cell"><code>Nocca.$cacheEntryRepository.addScenario</code></td>
    <td class="description-cell">
      Service function used to store a single scenario in the cache database.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>cacheentries.scenarioResetter</code></td>
    <td class="default-value-cell"><code>Nocca.$cacheEntryRepository.resetScenario</code></td>
    <td class="description-cell">
      Service function used to rewind a scenario to its initial state.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>requestForwarder</code></td>
    <td class="default-value-cell"><code>Nocca.$forwarder.defaultForwarder</code></td>
    <td class="description-cell">
      Request chain function responsible for sending the request to the target backend. It must add the properties
      <code>proxiedRequest</code> and <code>proxiedResponse</code> to the <code>RequestContext</code>.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>responder</code></td>
    <td class="default-value-cell"><code>Nocca.$responder</code></td>
    <td class="description-cell">
      Request chain function responsible for returning the result of the request chain to the client. It can select to
      send either the property <code>proxiedResponse</code> or <code>cacheentriesResponse</code>, based on rules it can define
      itself.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>failureHandlerFactory</code></td>
    <td class="default-value-cell"><code>Nocca.$errors.defaultFailureHandlerFactory</code></td>
    <td class="description-cell">
      Request chain builder function that should return a function able to handle errors that might occured with the request.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>throwHandlerFactory</code></td>
    <td class="default-value-cell"><code>Nocca.$errors.defaultThrowHandlerFactory</code></td>
    <td class="description-cell">
      Request chain builder function that should return a function able to handle thro
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>statistics</code></td>
    <td class="default-value-cell"><code>Object</code></td>
    <td class="description-cell">
      Configures the way Nocca gathers and distributes statistices about its operation.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>statistics.instance</code></td>
    <td class="default-value-cell"><code>Nocca.$stats</code></td>
    <td class="description-cell">
      Nocca plugin initializer function which is responsible for creating the statistics service. The value returned from this initializer should contain a <code>log</code>
      function which accepts an instance of <code>RequestContext</code> from which it gathers its statistics.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>statistics.mode</code></td>
    <td class="default-value-cell"><code>$constants.STATISTICS_LOG_MODE_REALTIME</code></td>
    <td class="description-cell">
      Configures the way statistics are pushed. The real-time mode will push any updates through the websocket interface immediately. There is a lazy mode configuration option which
      will send updates more lazily, but it is not yet implemented.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>statistics.reporters</code></td>
    <td class="default-value-cell"><code>[]</code></td>
    <td class="description-cell">
      Reporters ... 
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>chainBuilderFactory</code></td>
    <td class="default-value-cell"><code>Nocca.$chainBuilderFactory</code></td>
    <td class="description-cell">
      Nocca plugin initializer function which is responsible for creating the function that build a promise chain. This initializer should return a function which accepts an instance
      of a <code>RequestContext</code> and sets up the entire chain of plugins that need to handle the request. See the documentation of the default for more information. <strong>Be careful
      when overriding this, you can completely alter the way Nocca works with this</code>
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>allowEndpointOverrides</code></td>
    <td class="default-value-cell"><code>Object</code></td>
    <td class="description-cell">
      Configures which entries may be overridden per endpoint.
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>allowEndpointOverrides.keyGenerator</code></td>
    <td class="default-value-cell"><code></code></td>
    <td class="description-cell">
      placeholder
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>placeholder</code></td>
    <td class="default-value-cell"><code>placeholder</code></td>
    <td class="description-cell">
      placeholder
    </td>
  </tr>
  <tr class="property-row">
    <td class="property-cell"><code>placeholder</code></td>
    <td class="default-value-cell"><code>placeholder</code></td>
    <td class="description-cell">
      placeholder
    </td>
  </tr>
</table>

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

# Extending Nocca

Nocca plugins are modules which should expose an initializer method:

```javascript
module.exports = MyModule;

function MyModule(Nocca) {

  var myModule = {
      
  };
  // Initialize your module, assigning methods you implement to the myModule object

  return myModule; 
}
```

The initializer method is called when Nocca starts up. Nocca passes itself to the plugin initializer to allow plugins to access the correct instance
of Nocca. Every instance of Nocca will have new instances of each plugin, be aware of that when you write a plugin.

This plugin initializer should be used to setup the plugin, register functions and structurally create the plugin. Since Nocca is still initializing,
not all of its components may be accessible yet. There is a secondary plugin lifecycle function in which Nocca is guaranteed to have completed initializing
all plugins and configuration. That method is called `init` and should be part of the plugin returned by the plugin initializer:

```javascript
module.exports = MyModule;

function MyModule(Nocca) {

  var myModule = {
    init: function() {
      Nocca.pubsub.publish('someEvent');    
    }
  };
  
  return myModule;
}
```

The example above shows one of the things you can do with this. The pubsub channel inside Nocca can be used to establish inter-plugin communication. In the
`init()` call, every Nocca plugin will have been initialized and any plugin interested in events will have registered to the `pubsub` component. Publishing an
event before the `init()` call will not guarantee delivery of that event.

## Exposing a REST endpoint

If you have a plugin that wishes to expose some controls through the REST api, you can use the `pubsub` channel for this. For example, the default `scenarioRepository`
exposes its recording interface by registering several routes for this purpose:

```javascript
module.exports = ScenarioRepository;

function ScenarioRepository(Nocca) {

  return {
    init: function() {
      Nocca.pubsub.publish(Nocca.constants.PUBSUB_REST_ROUTE_ADDED, ['GET:/scenarios/recorder', getRecorder]);
    }
  };

  /* The httpApi component calls a route handler with the HTTP request, response, 
   * the Nocca config (deprecated), potential path variables, and two functions to write
   * to the response stream.
   */
  function getRecorder (req, res, config, match, writeHead, writeEnd) {
    var recordingState = isRecording();
    if (recordingState !== false) {

      writeHead(res, 200, {
        'Content-Type': 'application/json'
      }).writeEnd(JSON.stringify(recordingState));

    }
    else {
      writeHead(res, 404).writeEnd();
    }
  }
}

</style>