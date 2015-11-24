var EventEmitter = require('events').EventEmitter;
var util = require('util');

// protocol spec taken from https://github.com/NimVek/pipboy/blob/master/PROTOCOL.md
// thanks to NimVek for reverse engineering the protocol and publishing his efforts!

var Types = {
  Bool: 0,
  Int8: 1,
  UInt8: 2,
  Int32: 3,
  UInt32: 4,
  Float: 5,
  String: 6,
  List: 7,
  Dictionary: 8
};

function PipDB() {
  EventEmitter.call(this);

  this.properties = {}
  this.propertyTypes = {};
}

util.inherits(PipDB, EventEmitter);

module.exports = function() {
  var eventEmitter = new PipDB();
  eventEmitter.properties = {};
  eventEmitter.propertyTypes = {};

  eventEmitter.on('data', function(buffer) {
    var cursor = 0;

    while(cursor <= buffer.length - 5) {
      var type = buffer.readUInt8(cursor);
      var id = buffer.readUInt32LE(cursor + 1);
      this.propertyTypes[id] = type;

      cursor += 5;

      if(type <= 2) { // 8 bit number
        if(type === Types.Bool) {
          this.properties[id] = (buffer.readUInt8(cursor) === 0) ? false : true;
        } else if(type === Types.Int8) {
          this.properties[id] = buffer.readInt8(cursor);
        } else if(type === Types.UInt8) {
          this.properties[id] = buffer.readUInt8(cursor);
        }

        cursor += 1;
      } else if(type <= 5) { // 32 bit number
        if(type === Types.Int32) {
          this.properties[id] = buffer.readInt32LE(cursor);
        } else if(type === Types.UInt32) {
          this.properties[id] = buffer.readUInt32LE(cursor);
        } else if(type === Types.Float) {
          this.properties[id] = buffer.readFloatLE(cursor);
        }

        cursor += 4;
      } else if(type === Types.String) { // string
        var s = '';
        for(var i = cursor; i < buffer.length; i++) {
          if(buffer[i] !== 0) {
            s += String.fromCharCode(buffer[i]);
          } else {
            break;
          }
        }

        this.properties[id] = s;
        cursor += s.length + 1;
      } else if(type === Types.List) { // list
        var count = buffer.readUInt16LE(cursor);
        cursor += 2;

        var refs = [];
        for(var i = 0; i < count; i++) {
          var refId = buffer.readUInt32LE(cursor);
          refs.push(refId);
          cursor += 4;
        }

        this.properties[id] = refs;
      } else if(type === Types.Dictionary) { // dict
        var count = buffer.readUInt16LE(cursor);
        cursor += 2;

        var dict = {};

        for(var i = 0; i < count; i++) {
          var refId = buffer.readUInt32LE(cursor);
          cursor += 4;

          var name = '';
          for(var q = cursor; q < buffer.length; q++) {
            if(buffer[q] === 0) {
              break;
            } else {
              name += String.fromCharCode(buffer[q]);
            }
          }

          cursor += name.length + 1;
          dict[name] = refId;
        }

        this.properties[id] = dict;
        cursor += 2; // skip dummy uint16
      }
    }

    this.emit('db_update', this.normalizeDBEntry(0));
  });

  eventEmitter.normalizeDBEntry = function(index) {
    if(this.propertyTypes[index] === Types.Dictionary) {
      var dict = {};

      for(var i in this.properties[index]) {
        dict[i] = this.normalizeDBEntry(this.properties[index][i]);
      }

      return dict;
    } else if(this.propertyTypes[index] === Types.List) {
      var list = [];

      for(var i in this.properties[index]) {
        list.push(this.normalizeDBEntry(this.properties[index][i]));
      }

      return list;
    } else {
      return this.properties[index];
    }
  }

  return eventEmitter;
}
