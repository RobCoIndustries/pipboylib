require('buffertools').extend();
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// protocol spec taken from https://github.com/NimVek/pipboy/blob/master/PROTOCOL.md
// thanks to NimVek for reverse engineering the protocol and publishing his efforts!

var Channels = {
  Heartbeat: 0,
  Info: 1,
  GameBusy: 2,
  DatabaseUpdate: 3,
  LocalMapUpdate: 4,
  CommandRequest: 5,
  CommandResponse: 6
};

function PipDecode() {
  EventEmitter.call(this);

  this.buffer = new Buffer(0);
  this.expectedSize = null;
}

util.inherits(PipDecode, EventEmitter);

module.exports = function() {
  var emitter = new PipDecode();

  emitter.on('data', function(message) {
    this.buffer = this.buffer.concat(message);

    if(!this.expectedSize) {
      this.expectedSize = this.buffer.readUInt32LE(0) + 5;
    }

    if(this.buffer.length >= this.expectedSize) {
      var channel = this.buffer.readUInt8(4);
      var data = this.buffer.slice(5, this.expectedSize);

      switch(channel) {
        case Channels.Heartbeat:
          this.emit('heartbeat');
          break;
        case Channels.Info:
          this.emit('info', JSON.parse(data.toString()));
          break;
        case Channels.GameBusy:
          this.emit('game_busy');
          break;
        case Channels.DatabaseUpdate:
          this.emit('db_update', data);
          break;
        case Channels.LocalMapUpdate:
          this.emit('localmap_update', data);
          break;
        case Channels.CommandResponse:
          this.emit('command_response', JSON.parse(data.toString()));
          break;
      }

      this.buffer = this.buffer.slice(this.expectedSize);
      this.expectedSize = null;
    }
  });

  return emitter;
};
