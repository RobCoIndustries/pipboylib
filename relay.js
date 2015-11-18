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
 * Create a UDP relay for Fallout 4's pip boy server
 * @param {Object} upstreamInfo
 * @param {string} upstreamInfo.address
 * @param {number} upstreamInfo.port
 * @param {relayCallback} - callback that handles new data
 */
var UDPRelay = function UDPRelay (upstreamInfo, cb) {
  var server = dgram.createSocket('udp4')

  server.on('message', function (message, clientInfo) {
    var fakeClient = dgram.createSocket('udp4')

    fakeClient.on('message', function (message, serverInfo) {
      // Every time the fake client gets a message, we expect it from the Fallout server
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
        // TODO: Propagate an error
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

  server.bind(upstreamInfo.port, '0.0.0.0')
}

/**
 * Create a TCP relay for Fallout 4's pip boy server
 * @param {Object} upstreamInfo
 * @param {string} upstreamInfo.address
 * @param {number} upstreamInfo.port
 * @param {relayCallback} - callback that handles new data
 */
var TCPRelay = function TCPRelay (upstreamInfo, cb) {
  var server = net.createServer({'allowHalfOpen': true})

  server.on('connection', function (client) {
    // Now we create our fake client
    var fakeClient = new net.Socket()
    fakeClient.connect(upstreamInfo.port, upstreamInfo.address)

    var serverInfo = {}
    serverInfo.address = fakeClient.remoteAddress
    serverInfo.port = fakeClient.remotePort
    serverInfo.family = fakeClient.remoteFamily

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

    fakeClient.on('close', function (hadError) {
      if (hadError) {
        console.log('closure error')
        client.close()
      }
    })

    fakeClient.on('end', function () {
      console.log('ending')
      client.end()
    })

    fakeClient.on('error', function (err) {
      console.error(err)
    })

    fakeClient.on('timeout', function () {
      console.log('timeout')
    })

    fakeClient.on('drain', function () {
      console.log('drain')
    })
  })

  server.on('error', function (err) {
    console.error(err)
  })

  server.on('listening', function () {
    console.log('listening')
  })

  server.listen({'port': upstreamInfo.port})
}

module.exports = {
  UDPRelay: UDPRelay,
  TCPRelay: TCPRelay
}
