var dgram = require('dgram')

var FALLOUT_UDP_PORT = require('./lib/constants').FALLOUT_UDP_PORT
var FALLOUT_TCP_PORT = require('./lib/constants').FALLOUT_TCP_PORT
var AUTODISCOVERY_PAYLOAD = '{"cmd":"autodiscover"}'

var DiscoveryClient = function DiscoveryClient () {
  this.client = dgram.createSocket('udp4')
}

DiscoveryClient.prototype.discover = function discover (cb) {
  var autodiscover = function autodiscover () {
    this.setBroadcast(true)

    var message = new Buffer(AUTODISCOVERY_PAYLOAD)
    this.send(message, 0, message.length, FALLOUT_UDP_PORT, '255.255.255.255', function (err) {
      if (err) {
        cb(err)
      }
    })

    this.on('message', function (msg, rinfo) {
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

  this.client.bind(undefined, undefined, autodiscover)
}

DiscoveryClient.prototype.close = function close (cb) {
  this.client.close(cb)
}

module.exports = {
  DiscoveryClient: DiscoveryClient,
  PipDB: require('./lib/pipdb'),
  PipDecode: require('./lib/pipdecode'),
  PipMap: require('./lib/pipmap'),
  FALLOUT_UDP_PORT: FALLOUT_UDP_PORT,
  FALLOUT_TCP_PORT: FALLOUT_TCP_PORT
}
