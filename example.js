#!/usr/bin/env node
var hexy = require('hexy')
var util = require('util')
var _ = require('lodash')

var pipboylib = require('pipboylib')
var relay = require('pipboylib/lib/relay')

var UDPRelay = relay.UDPRelay
var TCPRelay = relay.TCPRelay

var falloutClient = new pipboylib.DiscoveryClient()

var parser = require('pipboylib/lib/parser')

var logPackets = false

var logEvents = true
var logEventFilter = ['name', 'payload']

var logUnparsedPayloads = true
var logUnparsedPayloadTruncate = 256

parser.on('readable', function() {
  var e
  while (e = parser.read()) {
    if (logEvents) {
      console.log(e.name, _.omit(e, logEventFilter))
    }

    if (logUnparsedPayloads && !e.data && e.payload) {
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

falloutClient.discover(function (error, server) {
  if (error) {
    return console.error(error)
  }
  console.log('Discovered: ', server)

  var udpRelay = new UDPRelay()
  udpRelay.bind(server.info, function (data, telemetry) {
    logMessage('[UDP Relay] ', data, telemetry)
  })

  var tcpServerInfo = {}
  tcpServerInfo.address = server.info.address
  tcpServerInfo.port = pipboylib.FALLOUT_TCP_PORT
  tcpServerInfo.family = server.info.family

  var tcpRelay = new TCPRelay()
  tcpRelay.listen(tcpServerInfo, function (data, telemetry) {
    logMessage('[TCP Relay] ', data, telemetry)
  })
  console.log('UDP and TCP Relay created for: ', server.info)
})
