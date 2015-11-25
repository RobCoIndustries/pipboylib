import dissolve from 'dissolve'

const COMMAND_TYPES = {
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
}

const OPCODE_NAMES = {
  0: 'keepAlive',
  1: 'connectionAccepted',
  2: 'connectionRefused',
  3: 'dataUpdate',
  4: 'mapUpdate',
  5: 'command',
  6: 'commandReply'
};

const COMMANDS = {
  0: o => o,
  1: o => Object.assign({}, o, {
    data: JSON.parse(o.payload)
  }),
  2: o => o, // TODO: raise an event, we might want to disconnect
  3: o => o, // TODO: this needs to be parsed inside the dissolve.loop
  4: o => o, // TODO: this needs to be parsed inside the dissolve.loop
  5: o => {
    o.data = JSON.parse(o.payload)
    if (COMMAND_TYPES[o.data.type]) {
      o.data.name = COMMAND_TYPES[o.data.type]
    }
    return o
  },
  6: o => o // TODO: this needs to be parsed inside the dissolve.loop
}

function opcodeMissing(o) {
  console.trace(opcodeMissing.name)
  return Object.assign(o, {
    error: 'has no handler or previous command not handled correctly',
    name: opcodeMissing.name
  })
}

export default dissolve().loop(function(end) {
  this
    .uint32('length')
    .int8('typeId')
    .tap(function() {
      if (this.vars.length) {
        this.buffer('payload', this.vars.length)
      }
    })
    .tap(function() {
      const command = COMMANDS[this.vars.typeId]
      if (typeof command === 'function') {
        const message = command(this.vars)
        message.name = OPCODE_NAMES[this.vars.typeId]
        this.push(message)
      } else {
        this.push(opcodeMissing(this.vars))
      }

      this.vars = {} // reset
    })
})
