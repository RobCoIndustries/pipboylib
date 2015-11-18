var dgram = require('dgram')

var FALLOUT_UDP_PORT = 28000
// var FALLOUT_TCP_PORT = 27000

var discover = function discover (cb) {
  var client = dgram.createSocket('udp4')

  var autodiscover = function autodiscover () {
    client.setBroadcast(true)

    var message = new Buffer('{"cmd":"autodiscover"}')
    client.send(message, 0, message.length, 28000, '255.255.255.255', function (err) {
      if (err) {
        cb(err)
      }
    })

    client.on('message', function (msg, rinfo) {
      try {
        var server = JSON.parse(msg.toString())
        server.info = rinfo
        cb(undefined, server)
      } catch (e) {
        cb(e, undefined)
        return
      }
    })
  }

  client.bind(undefined, undefined, autodiscover)
}

/**
 * Provides data from clients and servers going through the relay
 * @callback UDPRelay~dataCallback
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
 * UDP relay server for Fallout 4's pip boy server
 * @constructor
 * @param {string} remoteFallout - ip address of an upstream server
 * @param {UDPRelay~dataCallback} - callback that handles new data
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

  server.bind(FALLOUT_UDP_PORT, '0.0.0.0')
}

discover(function (error, server) {
  if (error) {
    console.error(error)
    return
  }
  // Set up a new relay for each running server
  var udpRelay = new UDPRelay(server.info, function (data, telemetry) {
    console.log(telemetry)
    console.log(data)
  })
  console.log(udpRelay)
})
