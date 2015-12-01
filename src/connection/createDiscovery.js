import dgram from 'dgram'

import {
  FALLOUT_UDP_PORT
} from '../constants'

import {
  Observable
} from 'rx'

const AUTODISCOVERY_PAYLOAD = '{"cmd":"autodiscover"}'

export default function createDiscovery() {
  const client = dgram.createSocket('udp4')

  const source = Observable.fromEvent(client, 'message')
    .map(x => Object.assign(JSON.parse(msg.toString()), { info: rinfo } ));

  client.bind(undefined, undefined, () => {
    client.setBroadcast(true)
    const message = new Buffer(AUTODISCOVERY_PAYLOAD)
    client.send(message, 0, message.length, FALLOUT_UDP_PORT, '255.255.255.255', err => {
      if (err) {
        // TODO: Observable
        throw err;
      }
    })
  })
  return source
}
