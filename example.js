import hexy from 'hexy'
import util from 'util'
import _ from 'lodash'

import {
  UDPRelay,
  TCPRelay,
  DiscoveryClient,
  parser,
  FALLOUT_TCP_PORT
} from './lib/index'

const falloutClient = new DiscoveryClient()

const logPackets = false
const logEvents = true
const logEventAttributeFilter = ['name', 'payload']
const logEventFilter = {
  keepAlive: true
};

const logUnparsedPayloads = true
const logUnparsedPayloadTruncate = 256

parser.on('readable', () => {
  let e
  while (e = parser.read()) {
    if (logEvents && !logEventFilter[e.name]) {
      console.log(e.name, _.omit(e, logEventAttributeFilter))
    }

    if (logUnparsedPayloads && !logEventFilter[e.name] && !e.data && e.payload) {
      console.log(
        hexy.hexy(
          e.payload.slice(0, Math.min(e.payload.length, logUnparsedPayloadTruncate))
        )
      )
    }
  }
})

function logMessage(name, data, t) {
  if (logPackets) {
    console.log(name,
      util.format(
        '%s:%d -> %s:%d',
        t.src.address,
        t.src.port,
        t.dst.address,
        t.dst.port
      )
    );
  }

  parser.write(data)
}

falloutClient.discover((error, server) => {
  if (error) {
    return console.error(error)
  }
  console.log('Discovered: ', server)

  const udpRelay = new UDPRelay()
  udpRelay.listen(server.info, (data, telemetry) => {
    logMessage('[UDP Relay] ', data, telemetry)
  })

  const tcpServerInfo = {
    address: server.info.address,
    port: FALLOUT_TCP_PORT,
    family: server.info.family
  }

  const tcpRelay = new TCPRelay()
  tcpRelay.listen(tcpServerInfo, (data, telemetry) => {
    logMessage('[TCP Relay] ', data, telemetry)
  })
  console.log('UDP and TCP Relay created for: ', server.info)
})
