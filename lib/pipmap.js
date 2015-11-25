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
