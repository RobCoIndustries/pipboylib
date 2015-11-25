var Commands = {
  UseItem: 0,
  DropItem: 1,
  SetFavorite: 2,
  ToggleComponentFavorite: 3,
  SortInventory: 4,
  ToggleQuestActive: 5,
  SetCustomMapMarker: 6,
  RemoveCustomMapMarker: 7,
  CheckFastTravel: 8,
  FastTravel: 9,
  MoveLocalMap: 10,
  ZoomLocalMap: 11,
  ToggleRadioStation: 12,
  RequestLocalMapSnapshot: 13,
  ClearIdle: 14,
};

var nextCommandId = 1;

function encodePacket(type, args) {
  var json = JSON.stringify({
    type: type,
    args: args,
    id: nextCommandId++
  });

  var buffer = new Buffer(5 + json.length);
  buffer.writeUInt32LE(json.length, 0);
  buffer.writeUInt8(5, 4); // channel 5 == command request
  buffer.write(json, 5);
  return buffer;
}

exports.createCommandPacket = function(type, args) {
  if(!Commands.hasOwnProperty(type)) {
    throw 'Unknown command type - ' + types;
  }

  return encodePacket(Commands[type], args);
}
