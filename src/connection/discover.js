import dgram from 'dgram'

import {
  FALLOUT_UDP_PORT
} from '../constants'

const AUTODISCOVERY_PAYLOAD = '{"cmd":"autodiscover"}'

export default function discover() {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket('udp4')
    client.bind(undefined, undefined, () => {
      client.setBroadcast(true)

      const message = new Buffer(AUTODISCOVERY_PAYLOAD)
      client.send(message, 0, message.length, FALLOUT_UDP_PORT, '255.255.255.255', err => {
        if (err) {
          reject(err)
        }
      })

      client.on('message', (msg, rinfo) => {
        try {
          client.close()
          resolve(Object.assign(JSON.parse(msg.toString()), {
            info: rinfo
          }))
        } catch (err) {
          reject(err)
        }
      })
    })
  })
}
