# Cherry Picking Keygen

Generate a request key from an incoming request.

The cherry picking keygen will pick all the 'cherries' that you define into an object and stringify it to create the request key. 

The subject of the picking is a prepared forwarding message to the matching endpoint url. For example, an endpoint that would forward to google.com would get `google.com` returned as `host` property.

## Usage

It can be configured for all endpoints or per endpoint:

```javascript
var $nocca = require('nocca');
var nocca = new $nocca({
    keyGenerator: ['cherryPickingKeygen', {
        properties: ['path', 'method'],
        url: ['pathname'],
        headers: ['accept', 'content-type', 'soapaction']
    }]
});
```

## Cherry picking options

### properties

An array of properties picked from the `httpMessage` object. Can be:

- `'method'`
- `'host'`
- `'protocol'`
- `'port'`
- `'path'`
- `'headers'`
- `'body'`

### url

An array of properties picked from the request url path:

- `'search'`
- `'query'`
- `'pathname'`
- `'path'`
- `'href'`

### query

An array of the query param names that should be extracted from the request.

### headers

An array of the header names that should be extracted from the request.

### fixed

A fixed object to add to the key. May be anything stringify-able:

```javascript
var $nocca = require('nocca');
var nocca = new $nocca({
    keyGenerator: ['cherryPickingKeygen', {
        fixed: ['customstring', { some: 'object' }]
    }]
});
```

### body

When using the request body an `xpath` or `json` picker needs to be selected.

#### xpath

Use `xpath` queries on the request body:

```javascript
var $nocca = require('nocca');
var nocca = new $nocca({
    keyGenerator: ['cherryPickingKeygen', {
        body: {
            xpath: [
                '//*[local-name()="CustomerIdentifier"]/text()',
                '//*[local-name()="IdentifierType"]/text()',
                '//*[local-name()="Body"]/*/*[local-name()="Password"]/text()'
            ]
        }
    }]
});
```

#### json

Retrieves properties from the message body JSON object. Formatted as dot-separated path:

```javascript
var $nocca = require('nocca');
var nocca = new $nocca({
    keyGenerator: ['cherryPickingKeygen', {
        body: {
            json: ['user.id']
        }
    }]
});
```
