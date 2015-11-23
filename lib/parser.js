var dissolve = require('dissolve')
var concentrate = require('concentrate')

var COMMAND_TYPES = {
  0: 'UseItem',
  1: 'DropItem',
  2: 'SetFavorite',
  3: 'ToggleComponentFavorite',
  4: 'SortInventory',
  5: 'ToggleQuestActive',
  6: 'SetCustomMapMarker',
  7: 'RemoveCustomMapMarker',
  8: 'CheckFastTravel',
  9: 'FastTravel',
  10: 'MoveLocalMap',
  11: 'ZoomLocalMap',
  12: 'ToggleRadioStation',
  13: 'RequestLocalMapSnapshot',
  14: 'ClearIdle',
};

var COMMANDS = {
  0: function keepAlive(o) {
    // TODO: raise an event, so caller might reply?
    return o
  },
  1: function connectionAccepted(o) {
    o.data = JSON.parse(o.payload)
    return o
  },
  2: function connectionRefused(o) {
    // TODO: raise an event, we might want to disconnect
    return o
  },
  3: function dataUpdate(o) {
    // TODO: this needs to be parsed inside the dissolve.loop
    return o
  },
  4: function mapUpdate(o) {
    // TODO: this needs to be parsed inside the dissolve.loop
    return o
  },
  5: function command(o) {
    o.data = JSON.parse(o.payload)
    if (COMMAND_TYPES[o.data.type]) {
      o.data.name = COMMAND_TYPES[o.data.type];
    }
    return o
  },
  6: function comandReply(o) {
    // TODO: this needs to be parsed inside the dissolve.loop
    return o
  },
}

function opcodeMissing(o) {
  o.error = 'has no handler or previous command not handled correctly'
  console.trace('opcodeMissing')
  o.name = opcodeMissing.name
  return o
}

var parser = module.exports = dissolve().loop(function(end) {
  this.uint32('length').tap(function() {
    this.int8('typeId').tap(function() {
      if (this.vars.length) {
        this.buffer('payload', this.vars.length)
        // TODO parse data_update, map_update here
      }
    })
  }).tap(function() {
    var command = COMMANDS[this.vars.typeId]
    if (typeof command === 'function') {
      var message = command(this.vars)
      message.name = command.name

      this.push(message)
    } else {
      this.push(opcodeMissing(this.vars))
    }

    this.vars = {} // reset
  })
})
