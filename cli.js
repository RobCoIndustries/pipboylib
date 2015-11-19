var DiscoveryClient = require('./index').DiscoveryClient
var UDPRelay = require('./relay').UDPRelay
var TCPRelay = require('./relay').TCPRelay

var util = require('util')

var FALLOUT_TCP_PORT = require('./constants').FALLOUT_TCP_PORT

var falloutClient = new DiscoveryClient()

falloutClient.discover(function (error, server) {
  if (error) {
    console.error(error)
    return
  }
  console.log('Discovered: ', server)

  // Set up a new relay for each running server

  var udpRelay = new UDPRelay()
  udpRelay.bind(server.info, function (data, telemetry) {
    var t = util.format('%s:%d -> %s:%d',
                        telemetry.src.address, telemetry.src.port,
                        telemetry.dst.address, telemetry.dst.port)
    console.log('[UDP Relay] <', t, '> ', data)
  })

  var tcpServerInfo = {}
  tcpServerInfo.address = server.info.address
  tcpServerInfo.port = FALLOUT_TCP_PORT
  tcpServerInfo.family = server.info.family

  var tcpRelay = new TCPRelay()
  tcpRelay.listen(tcpServerInfo, function (data, telemetry) {
    var t = util.format('%s:%d -> %s:%d',
                        telemetry.src.address, telemetry.src.port,
                        telemetry.dst.address, telemetry.dst.port)
    console.log('[TCP Relay] <', t, '> ', data)
  })
  console.log('UDP and TCP Relay created for: ', server.info)
})
