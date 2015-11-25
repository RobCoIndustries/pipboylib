var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');

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

  eventEmitter.read8BitNumber = function(id, type, buffer, cursor) {
    if(type === Types.Bool) {
      this.properties[id] = (buffer.readUInt8(cursor) === 0) ? false : true;
    } else if(type === Types.Int8) {
      this.properties[id] = buffer.readInt8(cursor);
    } else if(type === Types.UInt8) {
      this.properties[id] = buffer.readUInt8(cursor);
    }

    return cursor + 1;
  }

  eventEmitter.read32BitNumber = function(id, type, buffer, cursor) {
    if(type === Types.Int32) {
      this.properties[id] = buffer.readInt32LE(cursor);
    } else if(type === Types.UInt32) {
      this.properties[id] = buffer.readUInt32LE(cursor);
    } else if(type === Types.Float) {
      this.properties[id] = buffer.readFloatLE(cursor);
    }

    return cursor + 4;
  }

  eventEmitter.readString = function(id, buffer, cursor) {
    var s = '';
    for(var i = cursor; i < buffer.length; i++) {
      if(buffer[i] !== 0) {
        s += String.fromCharCode(buffer[i]);
      } else {
        break;
      }
    }

    this.properties[id] = s;
    return cursor + s.length + 1;
  }

  eventEmitter.readList = function(id, buffer, cursor) {
    var count = buffer.readUInt16LE(cursor);
    cursor += 2;

    var refs = [];
    for(var i = 0; i < count; i++) {
      var refId = buffer.readUInt32LE(cursor);
      refs.push(refId);
      cursor += 4;
    }

    this.properties[id] = refs;
    return cursor;
  }

  eventEmitter.readDictionary = function(id, buffer, cursor) {
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
    return cursor + 2; // skip dummy uint16
  }

  eventEmitter.on('data', function(buffer) {
    var cursor = 0;

    while(cursor <= buffer.length - 5) {
      var type = buffer.readUInt8(cursor);
      var id = buffer.readUInt32LE(cursor + 1);
      this.propertyTypes[id] = type;

      cursor += 5;

      if(type <= 2) { // 8 bit number
        cursor = this.read8BitNumber(id, type, buffer, cursor);
      } else if(type <= 5) { // 32 bit number
        cursor = this.read32BitNumber(id, type, buffer, cursor);
      } else if(type === Types.String) { // string
        cursor = this.readString(id, buffer, cursor);
      } else if(type === Types.List) { // list
        cursor = this.readList(id, buffer, cursor);
      } else if(type === Types.Dictionary) { // dict
        cursor = this.readDictionary(id, buffer, cursor);
      } else {
        this.emit('error', 'Unexpected type ID: ' + type);
        break;
      }
    }

    this.emit('db_update', this.normalizeDBEntry(0));
  });

  eventEmitter.normalizeDBEntry = function(index) {
    if(this.propertyTypes[index] === Types.Dictionary) {
      var dict = this.properties[index];
      return _.object(_.map(_.keys(dict), function(key) {
        return [key, this.normalizeDBEntry(dict[key])];
      }.bind(this)));
      dict._index = index;
      return dict;
    } else if(this.propertyTypes[index] === Types.List) {
      return _.map(this.properties[index], function(i) {
        return this.normalizeDBEntry(i);
      }.bind(this));
    } else {
      var item = this.properties[index];
      item._index = index;
      return item;
    }
  }

  return eventEmitter;
}
