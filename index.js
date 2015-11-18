var dgram = require('dgram')

var FALLOUT_UDP_PORT = require('./constants').FALLOUT_UDP_PORT

var discover = function discover (cb) {
  var client = dgram.createSocket('udp4')

  var autodiscover = function autodiscover () {
    client.setBroadcast(true)

    var message = new Buffer('{"cmd":"autodiscover"}')
    client.send(message, 0, message.length, FALLOUT_UDP_PORT, '255.255.255.255', function (err) {
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

module.exports = {
  discover: discover
}
