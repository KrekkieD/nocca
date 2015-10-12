# Distributed Delay

Delay responses given by Nocca.

This uses a normal distribution formula to randomize the exact delay used using a bell curve.

See the [Normal Distribution wiki](https://en.wikipedia.org/wiki/Normal_distribution) for more info.

Any time already consumed since beginning of the request will be subtracted from the delay. This includes any time
taken for a proxy server to respond:  
```delay = calculatedDelay - (current timestamp - request start timestamp)```

## Usage

```javascript
var noccaConfig = {

    responseDelay: ['distributedDelay', {
    
        // the target delay in milliseconds
        expectation: 100,
        
        // optional, the minimal amount of delay
        min: 400,
        
        // optional, the maximum amount of delay
        max: 600,
        
        // the variance used to calculate the delay
        variance: 0.1
    }],
    
    
    // you can also specify this per endpoint
    endpoints: {
        someEndpoint: {
            delay: ['distributedDelay', {
                expectation: 100,
                min: 400,
                max: 600,
                variance: 0.1
            }],
        },
        otherEndpoint: {
            // provide false as configuration to disable the delay
            delay: ['distributedDelay', false]
        }
    }
}
```
