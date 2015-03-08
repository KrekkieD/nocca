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
    <td class="property-cell">logger</td>
    <td class="default-value-cell">Nocca.$logger</td>
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
    <td class="property-cell">delay</td>
    <td class="default-value-cell">500</td>
    <td class="description-cell">
      The default delay used when responding to HTTP requests. Even if there is a recorded response, Nocca will wait this long before sending the response.
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




<style>

.table.table-properties {
}

.table-properties .header-row {
  font-weight: bold;
}

code, .table-properties .property-row .property-cell, .table-properties .property-row .default-value-cell {
  font-family: Inconsolata Monaco "Courier New" monospace;
}


</style>