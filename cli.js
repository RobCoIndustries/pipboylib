var DiscoveryClient = require('./index').DiscoveryClient
var UDPRelay = require('./relay').UDPRelay
var TCPRelay = require('./relay').TCPRelay

var FALLOUT_TCP_PORT = require('./constants').FALLOUT_TCP_PORT

var falloutClient = new DiscoveryClient()

falloutClient.discover(function (error, server) {
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

  var tcpRelay = new TCPRelay()
  tcpRelay.listen(tcpServerInfo, function (data, telemetry) {
    console.log('[TCP Relay] <', telemetry, '> ', data)
  })
  console.log('UDP and TCP Relay created for: ', server.info)
})
