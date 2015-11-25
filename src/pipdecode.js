import util from 'util';
import {
  EventEmitter
} from 'events';

// protocol spec taken from https://github.com/NimVek/pipboy/blob/master/PROTOCOL.md
// thanks to NimVek for reverse engineering the protocol and publishing his efforts!

const channels = {
  Heartbeat: 0,
  Info: 1,
  GameBusy: 2,
  DatabaseUpdate: 3,
  LocalMapUpdate: 4,
  CommandRequest: 5,
  CommandResponse: 6
}

export class PipDecode extends EventEmitter {
  constructor() {
    super()

    this.buffer = new Buffer(0)
    this.expectedSize = null

    this.on('data', data => {
      this.buffer = Buffer.concat([this.buffer, data])

      if (this.buffer.length < 5) {
        return; // The header was maybe split in two
      }

      if (this.expectedSize === undefined || this.expectedSize === null) {
        this.expectedSize = this.buffer.readUInt32LE(0)
      }

      if (this.buffer.length >= this.expectedSize + 5) {
        const size = this.expectedSize
        const channel = this.buffer.readUInt8(4)
        const payload = this.buffer.slice(5, this.expectedSize)

        switch (channel) {
          case channels.Heartbeat:
            this.emit('heartbeat')
            break;
          case channels.Info:
            try {
              this.emit('info', JSON.parse(payload.toString()))
            } catch (err) {
              this.emit('error', 'Corrupt Info JSON!')
            }
            break;
          case channels.GameBusy:
            this.emit('game_busy')
            break;
          case channels.DatabaseUpdate:
            this.emit('db_update', payload)
            break;
          case channels.LocalMapUpdate:
            this.emit('localmap_update', payload)
            break;
          case channels.CommandResponse:
            try {
              this.emit('command_response', JSON.parse(payload.toString()))
            } catch (err) {
              this.emit('error', 'Corrupt CommandResponse JSON!')
            }
            break;
        }

        this.buffer = this.buffer.slice(this.expectedSize)
        this.expectedSize = null
      }
    });
  }
}

export default function createPipDecode() {
  return new PipDecode()
}
