# Simple Message Transformer

String-based configuration powered message transformer, allows setup through JSON

## Usage:

```javascript
var noccaConfig = {
    // you should probably add this to a specific endpoint to run the transformation on
    endpoints: {
        someEndpoint: {
            // this property triggers the transformations
            httpMessageTransformations: {
                // this property (value from Nocca.constants) indicates on which http message to apply the transformation
                CLIENT_RESPONSE: [
                    // id of the plugin
                    'simpleMessageTransformer',
                    // plugin config, array of transformations
                    [
                        // each transformation is an object with a search and replace property
                        {
                            // what to look for
                            search: {
                                // currently only body is supported as search subject
                                subject: 'body',
                                // only regex-based searches are supported as search type
                                type: 'regex',
                                // array used in new RegExp(value[0], value[1]) (key 1 = flags)
                                // if string, transforms to value = [value, undefined]
                                value: ['<ttl>(\\d+)</ttl>']
                            },
                            // what to replace it with
                            replace: {
                                // which modifier to use
                                type: 'momentjs',
                                // modifier options
                                options: {
                                    source: {
                                        value: ''
                                    },
                                    add: {
                                        days: 1
                                    },
                                    format: 'x'
                                }
                            }
                        }
                    ]
                ]
            }
        }
    }
}
```

## Modifiers

### `math`

Does simple stuff with numbers.

#### `replace.value` (`int`, or `parseInt` returns `int`)

Adds value to search match.

```
replace.value = 5; // return searchMatch + 5
replace.value = -5; // return searchMatch + -5
```

### `replace.value` (`string`)

Looks for character at position 0 to determine action. Supports `*` and `/`.

```
replace.value = '*5'; // return searchMatch * 5
replace.value = '/5'; // return searchMatch / 5
```

### `momentjs`

Uses the `moment` library to manipulate or create dates. 

When multiple replacements are defined in the same transformation, it runs them in this order:

- `patchTimeDifference`
- `add`
- `subtract`

#### `replace.options.source` (`object`)

- `.value`
    - `undefined` or absent makes it use the search match.
    - `falsy` makes it the current date.
    - `string` uses the string to create a new `moment` date.
- `.format`
    - `string` to define the format of the source (`moment` may choke on auto detection of format)


#### `replace.options.patchTimeDifference` (`boolean`)

This patches a timestamp to use the same interval as the original message. Consider the following scenario:

- you record a login cache on June 22nd 15h00 which contains a timestamp in the body that sets the validity of your login to June 22nd 15h30.
- you play the cache on June 23rd 11h00, but your login fails as your login expired yesterday

What you'd really want is this timestamp to "move" with you. That is, the 30 minute validity should be based on the current
request time and not as much on the original request time. That is what this does.

It calculates the difference of `the original request timestamp` (June 22nd 15h00) and `the cache body timestamp` 
(June 22nd 15h30) which is 30 minutes, and adds that difference
to the `current request timestamp` (June 23rd 11h00) creating a timestamp that is June 23rd 11h30. 

#### `replace.options.add` (`object`)

Add values to the date.  
See the object format in [momentjs.com - add](http://momentjs.com/docs/#/manipulating/add/)

#### `replace.options.subtract` (`object`)

Subtract values from the date.  
See the object format in [momentjs.com - subtract](http://momentjs.com/docs/#/manipulating/subtract/)

#### `replace.options.format` (`object`)

How the result should be formatted.  
See [momentjs.com - format](http://momentjs.com/docs/#/displaying/format/)
