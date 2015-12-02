import dgram from 'dgram'

import {
  FALLOUT_UDP_PORT
} from '../constants'

import {
  Observable
} from 'rx'

const AUTODISCOVERY_PAYLOAD = '{"cmd":"autodiscover"}'

export default function createDiscovery() {
  const source = Observable.create(function (observer) {
    const client = dgram.createSocket('udp4')

    client.bind(undefined, undefined, () => {
      client.setBroadcast(true)

      const message = new Buffer(AUTODISCOVERY_PAYLOAD)

      client.send(message, 0, message.length, FALLOUT_UDP_PORT, '255.255.255.255', err => {
        if (err) {
          observer.onError(err);
        }
      })

      client.on('message', (msg, rinfo) => {
        try {
          const data = Object.assign(JSON.parse(msg.toString()), {
            info: rinfo
          });
          observer.onNext(data);
        } catch (err) {
          observer.onError(err);
        }
      })

      client.on('error', (err) => {
        observer.onError(err);
      })

      client.on('close', () => {
        observer.onCompleted();
      })
    })
    return () => {
      client.close();
    }
  })
  return source
}
