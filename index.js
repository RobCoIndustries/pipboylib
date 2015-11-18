var util = require('util')
var EventEmitter = require('events').EventEmitter

var dgram = require('dgram')

function PipBoy () {
  EventEmitter.call(this)
}

util.inherits(PipBoy, EventEmitter)

PipBoy.prototype.discover = function discover (cb) {
  this.on('server', cb)

  this.client = dgram.createSocket('udp4')

  var autodiscover = function autodiscover () {
    this.client.setBroadcast(true)

    var message = new Buffer('{"cmd":"autodiscover"}')
    this.client.send(message, 0, message.length, 28000, '255.255.255.255', function (err) {
      if (err !== undefined) {
        this.emit('error', err)
      }
    }.bind(this))

    this.client.on('message', function (msg, rinfo) {
      console.log('Received %d bytes from %s:%d\n',
                  msg.length, rinfo.address, rinfo.port)

      try {
        var data = JSON.parse(msg.toString())
        data.Address = rinfo.address
        data.Port = rinfo.port
        this.emit('server', data)
      } catch (e) {
        this.emit('error', e)
        return
      }
    }.bind(this))
  }

  this.client.bind(undefined, undefined, autodiscover.bind(this))
}

var pipboy = new PipBoy()

pipboy.on('error', function (err) {
  console.error(err)
})

pipboy.discover(function (data) {
  console.log(data)
})
