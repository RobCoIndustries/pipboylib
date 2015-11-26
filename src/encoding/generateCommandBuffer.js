const commands = {
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
}

let nextCommandId = 1
function encodePacket(type, args = []) {
  const payload = JSON.stringify({
    type: type,
    args: args,
    id: nextCommandId++
  });

  const buffer = new Buffer(5 + payload.length);
  buffer.writeUInt32LE(payload.length, 0);
  buffer.writeUInt8(5, 4); // channel 5 == command request
  buffer.write(payload, 5);
  return buffer;
}

export default function generateCommandBuffer(type, ...args) {
  if (args.length === 1 && Array.isArray(args[1])) {
    args = args[1]
  }

  if (!Commands.hasOwnProperty(type)) {
    throw `Unknown command type ${type}!`
  }

  return encodePacket(Commands[type], args)
}
