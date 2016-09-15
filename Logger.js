var dcl = require('dcl');
var stackTrace = require('stack-trace');
var dgram = require('dgram');
var path = require('path');
var sprintf = require('sprintf');


var Logger = dcl(null, {
  /**
   * Logger constructor
   * @param cfg {logHost, logPort}
   * @param processName Name of the process to display on log line
   */
  constructor: function(cfg, processName) {
    this._cfg = cfg || config.get('Globals.logger');
    this._server = new dgram.createSocket('udp4');
    this._processName = processName;
  },

  /**
   * Start listening on multicast socket and (by default) display messages
   * @param params {logConsumerFunction}
   */
  listen: function(params) {
    params = params || {};
    var self = this;
    var s = new dgram.createSocket({ type: 'udp4',reuseAddr: true});
    s.bind(self._cfg.logPort, function() {
      s.addMembership(self._cfg.logHost);
      s.on('message', function(data) {

        if(params.logConsumerFunction) {
          params.logConsumerFunction(data.toString());
        }else {
          self._defaultLogConsumer(data.toString());
        }
      });
    })
  },

  _defaultLogConsumer: function(data) {
    try {
      var o = JSON.parse(data);
      var logLine = o.processName + ' | ' + path.basename(o.source) + ':' + o.line + ' ' + o.message;
      console.log(logLine);
    }catch(ex) {
      console.trace(ex.toString() + data);
    }
  },

  /**
   * Log a message object by adding its process id, process name, source name and line number
   * @param msg
   */
  log: function(msg) {

    var argKeys = Object.keys(arguments);
    var akl = argKeys.length;
    var args = [];
    for(var aki=0; aki<akl; aki++) {
      args.push(arguments[argKeys[aki]]);
    }

    msg = args.join(', ');

    var trace = stackTrace.get();


    var fileName = null;
    var lineNumber = 0;

    try{
      fileName = trace[1].getFileName();
      lineNumber = trace[1].getLineNumber();
    }catch(ex) {
      console.trace(ex.toString());
    }

    var o = {
      pid: process.pid,
      processName: this._processName,
      message: msg,
      source: fileName,
      line: lineNumber
    };

    var b = new Buffer(JSON.stringify(o));
    this._server.send(b, 0, b.length,this._cfg.logPort, this._cfg.logHost);
  }
});

// test code
if (require.main != 'module') {
  var l = new Logger({
    logPort: 4000,
    logHost: '225.0.0.1',
  }, process.argv[3]);


  if (process.argv[2] === 'sender') {
    setInterval(function () {
      l.log("This is a multicast log message ", new Date().toString());
    }, 1000);
  } else {
    l.listen();
  }
}