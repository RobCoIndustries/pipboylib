# pipboylib

a companion pip boy library for Fallout 4

## Usage

This is intended to become just a library, with a main outside. The prototype dumping cli is in `cli.js`. Run it with `node cli.js`.

For more programmatic usage of this library, use something like this:

```javascript
var discover = require('./index').discover
var UDPRelay = require('./relay').UDPRelay
var TCPRelay = require('./relay').TCPRelay

var FALLOUT_TCP_PORT = require('./constants').FALLOUT_TCP_PORT

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
```

## TODO

* [X] UDP Autodiscovery of other pip boy servers [Bronze]
* [X] UDP Relay of another pip boy server [Silver]
* [X] TCP Relay of another pip boy server [Silver]
* [ ] Decode initial stats response from a pip boy server [Gold]
* [ ] Document the wire protocol app -> server [Gold]
* [ ] Document the wire protocol server -> app [Gold]
* [ ] Finish all of the above [Platinum]
