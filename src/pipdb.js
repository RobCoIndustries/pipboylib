import util from 'util'
import _ from 'lodash'

import {
  EventEmitter
} from 'events'

// protocol spec taken from https://github.com/NimVek/pipboy/blob/master/PROTOCOL.md
// thanks to NimVek for reverse engineering the protocol and publishing his efforts!

const types = {
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

export default class PipDB extends EventEmitter {
  constructor() {
    super()

    this.properties = {}

    this.on('data', buffer => {
      let cursor = 0;

      while (cursor <= buffer.length - 5) {
        const type = buffer.readUInt8(cursor);
        const id = buffer.readUInt32LE(cursor + 1);
        cursor += 5;

        switch (type) {
          case types.Bool:
          case types.Int8:
          case types.UInt8: {
            // 8 bit
            cursor = this.read8BitNumber(id, type, buffer, cursor)
            break
          }

          case types.Int32:
          case types.UInt32:
          case types.Float: {
            // 32 bit
            cursor = this.read32BitNumber(id, type, buffer, cursor)
            break
          }

          case types.String: {
            cursor = this.readString(id, buffer, cursor)
            break
          }

          case types.List: {
            cursor = this.readList(id, buffer, cursor)
            break
          }

          case types.Dictionary: {
            cursor = this.readDictionary(id, buffer, cursor)
            break
          }

          default: {
            throw `Unexpected type ID ${type}!`
          }
        }
      }

      this.emit('db_update', this.normalizeDBEntry(0))
    })
  }

  read8BitNumber(id, type, buffer, cursor) {
    if (type === types.Bool) {
      this.properties[id] = (buffer.readUInt8(cursor) === 0) ? false : true
    } else if(type === types.Int8) {
      this.properties[id] = buffer.readInt8(cursor)
    } else if(type === types.UInt8) {
      this.properties[id] = buffer.readUInt8(cursor)
    }

    return cursor + 1
  }

  read32BitNumber(id, type, buffer, cursor) {
    if (type === types.Int32) {
      this.properties[id] = buffer.readInt32LE(cursor)
    } else if(type === types.UInt32) {
      this.properties[id] = buffer.readUInt32LE(cursor)
    } else if(type === types.Float) {
      this.properties[id] = buffer.readFloatLE(cursor)
    }

    return cursor + 4
  }

  readString(id, buffer, cursor) {
    let i
    for (i = cursor; i < buffer.length; i++) {
      if (buffer[i] === 0) {
        break
      }
    }

    this.properties[id] = buffer.slice(cursor, cursor + i).toString('utf8')
    return cursor + i + 1
  }

  readList(id, buffer, cursor) {
    const count = buffer.readUInt16LE(cursor)
    cursor += 2

    const refs = []
    for (let i = 0; i < count; i++) {
      const refId = buffer.readUInt32LE(cursor)
      refs.push(refId)
      cursor += 4
    }

    this.properties[id] = refs
    return cursor;
  }

  readDictionary(id, buffer, cursor) {
    const insertCount = buffer.readUInt16LE(cursor)
    cursor += 2;

    let dict = this.properties[id] || {}

    for (let i = 0; i < insertCount; i++) {
      const refId = buffer.readUInt32LE(cursor)
      cursor += 4

      let j
      for (j = cursor; j < buffer.length; j++) {
        if (buffer[j] === 0) {
          break
        }
      }

      const key = buffer.slice(cursor, cursor + j).toString('utf8')
      cursor += j + 1
      dict[key] = refId
    }

    const removeCount = buffer.readUInt16LE(cursor)
    cursor += 2

    for (let i = 0; i < removeCount; i++) {
      const refId = buffer.readUInt32LE(cursor)
      cursor += 4

      dict = _.omit(dict, key => dict[key] === refId)
      this.properties[refId] = null
    }

    this.properties[id] = dict
    return cursor
  }

  normalizeDBEntry(index) {
    const obj = this.properties[index];

    if (Array.isArray(obj)) {
      return this.properties[index].map(x => this.normalizeDBEntry(x));
    } else if (typeof obj === 'object') {
      const res = _.object(Object.keys(obj).map(key => [key, this.normalizeDBEntry(obj[key])]));
      res._index = index;
      return res;
    }

    return obj;
  }
}

export default function createPipDB() {
  return new PipDB();
}
