# Key Generator (`interface: keyGenerator`)

## method: generateKey

### Arguments

`reqContext`

### Return value

`promise`

### Expected functionality

Resolved with `reqContext` when done.
Rejected when not completable.
Should create property `reqContext.requestKey` (`string`) with value of generated key. 
