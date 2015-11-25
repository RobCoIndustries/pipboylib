export default function decodeMap(buffer) {
  let cursor = 8
  let width = buffer.readUInt32LE(0)
  const height = buffer.readUInt32LE(4)

  function decodeExtents() {
    const res = {
      x: buffer.readFloatLE(cursor),
      y: buffer.readFloatLE(cursor + 4)
    };
    cursor += 8
    return res
  }

  const nw = decodeExtents()
  const ne = decodeExtents()
  const sw = decodeExtents()

  // fix for invalid map size from https://github.com/nkatsaros/pipboygo/blob/master/protocol/map.go#L55
  // originally from https://github.com/CyberShadow/csfo4/blob/master/mapfix/mapfix.d
  // thanks to nkatsaros and CyberShadow!
  if (width * height < buffer.length - 32) {
    width = (buffer.length - 32) / height
    if (buffer.length !== 32 + width * height) {
      throw 'Invalid map stride!'
    }
  }

  return {
    width: width,
    height: height,
    pixels: buffer.slice(cursor, cursor + width * height),
    extents: {
      nw: nw,
      ne: ne,
      sw: sw
    }
  }
}
