var dcl = require('dcl');
var stackTrace = require('stack-trace');
var dgram = require('dgram');
var path = require('path');
var sprintf = require('sprintf');


module.exports = dcl(null, {
  /**
   * Logger constructor
   * @param cfg {logHost, logPort}
   * @param processName Name of the process to display on log line
   */
  constructor: function(cfg, processName) {
    this._cfg = cfg || {};
    this._server = new dgram.createSocket('udp4');
    this._listener = null;
    this._processName = processName;
  },

  /**
   * Start listening on multicast socket and (by default) display messages
   * @param params {logConsumerFunction}
   * @callback optional callback function to be called after the socket operation completes
   */
  listen: function(params, callback) {
    params = params || {};
    var self = this;
    self._listener = new dgram.createSocket({ type: 'udp4',reuseAddr: true});
    self._listener.bind(self._cfg.logPort, function() {
      self._listener.addMembership(self._cfg.logHost);
      self._listener.on('message', function(data) {

        if(params.logConsumerFunction) {
          params.logConsumerFunction(data.toString());
        }else {
          self._defaultLogConsumer(data.toString());
        }
      });

      if(typeof(callback) == 'function') {
        callback();
      }
    })
  },

  /**
   * default log consumer, just formats and prints the message to stdout
   * @param data JSON message
   */
  _defaultLogConsumer: function(data) {
    try {
      var o = JSON.parse(data);
      var logLine = o.processName + ' | ' + path.basename(o.source) + ':' + o.line + ' ' + o.messages.join(', ');
      console.log(logLine);
    }catch(ex) {
      console.trace(ex.toString() + data);
    }
  },

  /**
   * closes open sockets
   */
  close: function() {
    this._server.close();
    this._server = null;
    if(this._listener) {
      this._listener.close();
      this._listener = null;
    }
  },

  /**
   * Log a message object by adding its process id, process name, source name and line number
   * @param msg
   * @optional callback function to be called after the socket operation completes
   */
  log: function() {

    var argKeys = Object.keys(arguments);
    var akl = argKeys.length;
    var messages = [];
    var callback = null;

    for(var aki=0; aki<akl; aki++) {
      var arg = arguments[argKeys[aki]];
      if(aki == akl-1 && typeof(arg) == 'function') {
        callback = arg;
      }else{
        messages.push(arg);
      }
    }

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
      messages: messages,
      source: fileName,
      line: lineNumber
    };

    var b = new Buffer(JSON.stringify(o));
    this._server.send(b, 0, b.length,this._cfg.logPort, this._cfg.logHost, function() {
      callback();
    });
  }
});

