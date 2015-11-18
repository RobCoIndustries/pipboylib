var dgram = require('dgram')

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
        var data = JSON.parse(msg.toString())
        data.Address = rinfo.address
        data.Port = rinfo.port
        cb(undefined, data)
      } catch (e) {
        cb(e, undefined)
        return
      }
    })
  }

  client.bind(undefined, undefined, autodiscover)
}

discover(function (error, data) {
  if (error) {
    console.error(error)
    return
  }
  console.log(data)
})
