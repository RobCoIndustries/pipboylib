import dgram from 'dgram'
import {
  createServer,
  Socket
} from 'net'

/**
 * Provides data from clients and servers going through the relay
 * @callback relayCallback
 * @param {Buffer} data
 * @param {Object} telemetry
 * @param {Object} telemetry.src
 * @param {string} telemetry.src.address
 * @param {number} telemetry.src.port
 * @param {Object} telemetry.dst
 * @param {string} telemetry.dst.address
 * @param {number} telemetry.dst.port
 */

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
        console.error(err)
      })

      client.on('close', hadError => {
        if (hadError) {
          console.error('error on close')
        }
        fakeClient.close()
      })

      client.on('end', () => {
        fakeClient.end()
      })

      fakeClient.on('close', hadError => {
        if (hadError) {
          console.error('error on close')
        }
        client.close()
      })

      fakeClient.on('end', () => {
        client.end()
      })

      fakeClient.on('error', err => {
        console.error(err)
      })
    })

    this.server.on('error', err => {
      console.error(err)
    })

    this.server.listen({
      port: upstreamInfo.port
    })
  }

  close(cb) {
    this.server.close(cb)
  }
}
