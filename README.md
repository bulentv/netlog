# netlogger

Network logging library for node.js

## Installation

    npm install netlogger
  


## Usage:
```js
    var NetLogger = require('netlogger');
    
    var netLogger = new NetLogger({
      logPort: 4000,
      logHost: '225.0.0.1',
    }, 'Test Procesess');
```    
To listen messages from network:
```js
    netLogger.listen();
```    
    
To broadcast log messages:
```js
    netLogger.log("This is a log message")
```    
    
You can optionally provide a callback to wait for message before continue:
```js
    netLogger.log("This is a log message", function() {
      /// ...
    });
```

## Contributions
Please open PR
