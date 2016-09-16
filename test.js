var NetLogger = require('./');

var netLogger = new NetLogger({
  logPort: 4000,
  logHost: '225.0.0.1',
}, 'Test Procesess');

netLogger.listen();

var repeat = 4;
var msgno = 1;

function sendMsg() {
  netLogger.log("This is a test log message (" + msgno + "/" + repeat + ") ", new Date().toString(), function() {
    setTimeout( function() {
      if(++msgno > repeat) {
        return netLogger.close();
      }
      sendMsg();
    }, 1000);
  });
}
sendMsg();
