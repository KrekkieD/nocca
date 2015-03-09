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
    <td class="default-value-cell"><code>Nocca.$</code></td>
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



</style>