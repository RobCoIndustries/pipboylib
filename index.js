var dgram = require('dgram')
var net = require('net')

var FALLOUT_UDP_PORT = 28000
var FALLOUT_TCP_PORT = 27000

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

  server.bind(FALLOUT_UDP_PORT, '0.0.0.0')
}

/**
 * Create a TCP relay for Fallout 4's pip boy server
 * @param {Object} upstreamInfo
 * @param {string} upstreamInfo.address
 * @param {number} upstreamInfo.port
 * @param {relayCallback} - callback that handles new data
 */
var TCPRelay = function TCPRelay (upstreamInfo, cb) {
  var server = net.createServer()

  server.on('connection', function (client) {
    // Client has connected, set up our connection to upstream
    var clientInfo = client.address()

    // Now we create our fake client
    var fakeClient = new net.Socket()
    fakeClient.connect(upstreamInfo.port, upstreamInfo.address)

    fakeClient.on('connect', function () {
      console.log('connected')
      // Now connected
      client.pipe(fakeClient)
    })

    fakeClient.on('close', function (hadError) {
      if (hadError) {
        console.log('ERRZORZ')
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

    fakeClient.on('data', function (message) {
      var copiedBuffer = new Buffer(message.length)
      message.copy(copiedBuffer)

      var serverInfo = {}
      serverInfo.address = fakeClient.remoteAddress
      serverInfo.port = fakeClient.remotePort
      serverInfo.family = fakeClient.remoteFamily

      var telemetry = {
        'src': serverInfo,
        'dst': clientInfo
      }

      fakeClient.pipe(client)

      cb(copiedBuffer, telemetry)
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

discover(function (error, server) {
  if (error) {
    console.error(error)
    return
  }
  console.log('Discovered: ', server)

  // Set up a new relay for each running server
  UDPRelay(server.info, function (data, telemetry) {
    console.log('[UDP Relay] <', telemetry, '> ', data)
  })

  var tcpServerInfo = {}
  tcpServerInfo.address = server.info.address
  tcpServerInfo.port = FALLOUT_TCP_PORT
  tcpServerInfo.family = server.info.family

  TCPRelay(tcpServerInfo, function (data, telemetry) {
    console.log('[TCP Relay] <', telemetry, '> ', data)
  })
  console.log('UDP and TCP Relay created for: ', server.info)
})
