import commands from '../constants'

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
