var dgram = require('dgram')
var net = require('net')

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

/**
 * Create a UDP Relay
 * @constructor
 */
var UDPRelay = function UDPRelay () {
  this.server = dgram.createSocket('udp4')
}

/**
 * Bind the UDP Relay using upstreamInfo
 * @param {Object} upstreamInfo
 * @param {string} upstreamInfo.address
 * @param {number} upstreamInfo.port
 * @param {relayCallback} - callback that receives data
 */
UDPRelay.prototype.bind = function UDPRelay (upstreamInfo, cb) {
  var server = this.server
  this.server.on('message', function (message, clientInfo) {
    var fakeClient = dgram.createSocket('udp4')

    fakeClient.on('message', function (message, serverInfo) {
      // Every time the fake client gets a message, we expect it from the upstream server
      if (serverInfo.address === upstreamInfo.address &&
          serverInfo.port === upstreamInfo.port) {
        var copiedBuffer = new Buffer(message.length)
        message.copy(copiedBuffer)

        // Now emulate our server
        server.send(message, 0, message.length, clientInfo.port, clientInfo.address)
        var telemetry = {
          'src': serverInfo,
          'dst': clientInfo
        }
        cb(copiedBuffer, telemetry)
      } else {
        // Ignore responses not coming from the upstream server
      }
    })

    // As soon as our client is ready, go ahead and send their message onward
    fakeClient.bind(undefined, undefined, function () {
      var copiedBuffer = new Buffer(message.length)
      message.copy(copiedBuffer)

      fakeClient.send(message, 0, message.length, upstreamInfo.port, upstreamInfo.address)
      var telemetry = {
        'src': clientInfo,
        'dst': upstreamInfo
      }
      cb(copiedBuffer, telemetry)
    })
  })

  this.server.bind(upstreamInfo.port, '0.0.0.0')
}

/**
 * Create a TCP relay for an upstream server
 * @constructor
 */
var TCPRelay = function TCPRelay () {
  this.server = net.createServer({'allowHalfOpen': true})
}

/**
 * Listen for traffic to relay to/from an upstream server
 * @param {Object} upstreamInfo
 * @param {string} upstreamInfo.address
 * @param {number} upstreamInfo.port
 * @param {relayCallback} - callback that handles new data
 */
TCPRelay.prototype.listen = function listen (upstreamInfo, cb) {
  this.server.on('connection', function (client) {
    // Now we create our fake client
    var fakeClient = new net.Socket()
    fakeClient.connect(upstreamInfo.port, upstreamInfo.address)

    var actualClientInfo = {}
    actualClientInfo.address = client.remoteAddress
    actualClientInfo.port = client.remotePort
    actualClientInfo.family = client.remoteFamily

    fakeClient.on('connect', function () {
      // Once we're connected, we can get each message from the client
      client.on('data', function (message) {
        var copiedBuffer = new Buffer(message.length)
        message.copy(copiedBuffer)

        // To the server
        fakeClient.write(message)

        var serverInfo = {}
        serverInfo.address = fakeClient.remoteAddress
        serverInfo.port = fakeClient.remotePort
        serverInfo.family = fakeClient.remoteFamily

        var telemetry = {
          'src': actualClientInfo,
          'dst': serverInfo
        }

        cb(copiedBuffer, telemetry)
      })
    })

    fakeClient.on('data', function (message) {
      var copiedBuffer = new Buffer(message.length)
      message.copy(copiedBuffer)

      var serverInfo = {}
      serverInfo.address = fakeClient.remoteAddress
      serverInfo.port = fakeClient.remotePort
      serverInfo.family = fakeClient.remoteFamily

      var telemetry = {
        'src': serverInfo,
        'dst': actualClientInfo
      }
      client.write(message)

      cb(copiedBuffer, telemetry)
    })

    client.on('error', function (err) {
      console.error(err)
    })

    client.on('close', function (hadError) {
      if (hadError) {
        console.error('error on close')
      }
      fakeClient.close()
    })

    client.on('end', function () {
      fakeClient.end()
    })

    fakeClient.on('close', function (hadError) {
      if (hadError) {
        console.error('error on close')
      }
      client.close()
    })

    fakeClient.on('end', function () {
      client.end()
    })

    fakeClient.on('error', function (err) {
      console.error(err)
    })
  })

  this.server.on('error', function (err) {
    console.error(err)
  })

  this.server.listen({'port': upstreamInfo.port})
}

TCPRelay.prototype.close = function close (cb) {
  this.server.close(cb)
}

module.exports = {
  UDPRelay: UDPRelay,
  TCPRelay: TCPRelay
}
