var NetLogger = require('./');

var logHost, logPort;
if(!process.argv[2] || !process.argv[3]) {
  console.log("Usage :\nnode monitor [Multicast IP] [Port]\n");
  process.exit();
}

var netLogger = new NetLogger({
  logPort: process.argv[3],
  logHost: process.argv[2]
}, 'not used');

netLogger.listen();
console.log("Listening logs on " + process.argv[2] + ':' + process.argv[3]);

