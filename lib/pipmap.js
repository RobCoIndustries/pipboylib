exports.decodeMap = function(buffer) {
  var cursor = 0;
  var width = buffer.readUInt32LE(cursor);
  cursor += 4;
  var height = buffer.readUInt32LE(cursor);
  cursor += 4;

  function decodeExtents() {
    var x = buffer.readFloatLE(cursor);
    cursor += 4;
    var y = buffer.readFloatLE(cursor);
    cursor += 4;

    return {x: x, y: y};
  }

  var nw = decodeExtents();
  var ne = decodeExtents();
  var sw = decodeExtents();

  // fix for invalid map size from https://github.com/nkatsaros/pipboygo/blob/master/protocol/map.go#L55
  // originally from https://github.com/CyberShadow/csfo4/blob/master/mapfix/mapfix.d
  // thanks to nkatsaros and CyberShadow!
  if (width * height < buffer.length - 32) {
    width = (buffer.length - 32) / height;
    if (buffer.length != 32 + width * height) {
        throw 'invalid map stride';
    }
  }

  var pixels = buffer.slice(cursor, cursor + width * height);

  return {
    width: width,
    height: height,
    pixels: pixels,
    extents: {
      nw: nw,
      ne: ne,
      sw: sw
    }
  };
}
