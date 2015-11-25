import dgram from 'dgram'

import {
  FALLOUT_UDP_PORT
} from './constants'

const AUTODISCOVERY_PAYLOAD = '{"cmd":"autodiscover"}'

export default class DiscoveryClient {
  constructor() {
    this.client = dgram.createSocket('udp4')
  }

  discover(cb) {
    this.client.bind(undefined, undefined, () => {
      this.client.setBroadcast(true)

      const message = new Buffer(AUTODISCOVERY_PAYLOAD)
      this.client.send(message, 0, message.length, FALLOUT_UDP_PORT, '255.255.255.255', err => {
        if (err) {
          cb(err)
        }
      })

      this.client.on('message', (msg, rinfo) => {
        try {
          cb(null, Object.assign({}, JSON.parse(msg.toString()), {
            info: rinfo
          }))
        } catch (err) {
          cb(err)
        }
      })
    })
  }

  close(cb) {
    this.client.close(cb)
  }
}
