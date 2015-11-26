import dgram from 'dgram'

export class UDPRelay {
  constructor() {
    this.server = dgram.createSocket('udp4')
  }

  /**
   * Bind the UDP Relay using upstreamInfo
   * @param {Object} upstreamInfo
   * @param {string} upstreamInfo.address
   * @param {number} upstreamInfo.port
   * @param {relayCallback} - callback that receives data
   */
  listen(upstreamInfo, cb) {
    const server = this.server
    server.on('message', (_message, clientInfo) => {
      const fakeClient = dgram.createSocket('udp4')

      fakeClient.on('message', (message, serverInfo) => {
        // Every time the fake client gets a message, we expect it from the upstream server
        if (
          serverInfo.address === upstreamInfo.address &&
          serverInfo.port === upstreamInfo.port
        ) {
          const copiedBuffer = new Buffer(message)

          // Now emulate our server
          server.send(message, 0, message.length, clientInfo.port, clientInfo.address)

          cb(copiedBuffer, {
            src: serverInfo,
            dst: clientInfo
          })
        }

        // Ignore responses not coming from the upstream server
      })
    })

    this.server.bind(upstreamInfo.port, '0.0.0.0')
  }

  close(cb) {
    this.server.close(cb)
  }
}

export default function createUDPRelay() {
  return new UDPRelay()
}
