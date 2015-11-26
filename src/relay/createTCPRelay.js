import {
  createServer,
  Socket
} from 'net'

export class TCPRelay {
  constructor() {
    this.server = createServer({
      allowHalfOpen: true
    })
  }

  /**
   * Listen for traffic to relay to/from an upstream server
   * @param {Object} upstreamInfo
   * @param {string} upstreamInfo.address
   * @param {number} upstreamInfo.port
   * @param {relayCallback} - callback that handles new data
   */
  listen(upstreamInfo, cb) {
    this.server.on('connection', client => {
      // Now we create our fake client
      const fakeClient = new Socket()
      fakeClient.connect(upstreamInfo.port, upstreamInfo.address)

      const actualClientInfo = {
        address: client.remoteAddress,
        port: client.remotePort,
        family: client.remoteFamily
      }

      fakeClient.on('connect', () => {
        // Once we're connected, we can get each message from the client
        client.on('data', message => {
          const copiedBuffer = new Buffer(message)

          // To the server
          fakeClient.write(message)

          cb(copiedBuffer, {
            src: actualClientInfo,
            dst: {
              address: fakeClient.remoteAddress,
              port: fakeClient.remotePort,
              family: fakeClient.remoteFamily
            }
          })
        })
      })

      fakeClient.on('data', message => {
        const copiedBuffer = new Buffer(message)

        client.write(message)

        cb(copiedBuffer, {
          src: {
            address: fakeClient.remoteAddress,
            port: fakeClient.remotePort,
            family: fakeClient.remoteFamily
          },
          dst: actualClientInfo
        })
      })

      client.on('error', err => {
        throw err
      })
      fakeClient.on('error', err => {
        throw err
      })

      client.on('close', () => {
        fakeClient.close()
      })
      fakeClient.on('close', () => {
        client.close()
      })

      client.on('end', () => {
        fakeClient.end()
      })
      fakeClient.on('end', () => {
        client.end()
      })
    })

    this.server.on('error', err => {
      throw err
    })

    this.server.listen({
      port: upstreamInfo.port
    })
  }

  close(cb) {
    this.server.close(cb)
  }
}

export default function createTCPRelay() {
  return new TCPRelay()
}
