export default function parseBinaryDatabase(buf) {
  let offset = 0
  const bundle = {}

  while (offset < buf.length) {
    const type = buf.readInt8(offset)
    const id = buf.readInt32LE(offset + 1)
    let length = 5

    switch (type) {
      case 0: {
        const data = buf.readUInt8(offset + length)
        bundle[id] = (data === 1 ? true : false)
        length += 1
        break
      }

      case 1: {
        const data = buf.readInt8(offset + length)
        bundle[id] = data
        length += 1
        break
      }

      case 2: {
        const data = buf.readUInt8(offset + length)
        bundle[id] = data
        length += 1
        break
      }

      case 3: {
        const data = buf.readInt32LE(offset + length)
        bundle[id] = data
        length += 4
        break
      }

      case 4: {
        const data = buf.readUInt32LE(offset + length)
        bundle[id] = data
        length += 4
        break
      }

      case 5: {
        const data = buf.readFloatLE(offset + length)
        bundle[id] = data
        length += 4
        break
      }

      case 6: {
        // Read zero terminated string
        let _size = 0
        do {
          _size++
          if (offset + length + _size > buf.length) {
            throw 'Can\'t find termination of string. Data incomplete?'
          }
        } while (buf[offset + length + _size - 1] != 0x00)

        const data = buf
          .slice(offset + length, offset + length + _size - 1)
          .toString('utf8')
        bundle[id] = data
        length += _size
        break
      }

      case 7: {
        // Parse list of ids
        const _count = buf.readUInt16LE(offset + length)
        const data = []
        length += 2

        for (let i = 0; i < _count; i++) {
          data.push(buf.readUInt32LE(offset + length + (4 * i)))
        }
        length += 4 * _count

        bundle[id] = data
        break
      }

      case 8: {
        // Parse bundle modifications
        const _insertCount = buf.readUInt16LE(offset + length)
        length += 2

        const insert = {}
        for (let i = 0; i < _insertCount; i++) {
          const key = buf.readUInt32LE(offset + length).toString()
          length += 4

          // Parse zero-terminated string (key)
          let _size = 0
          do {
            _size++
            if (offset + length + _size > buf.length) {
              throw 'Can\'t find termination of string. Data incomplete?'
            }
          } while (buf[offset + length + _size - 1] != 0x00)

          const data = buf
            .slice(offset + length, offset + length + _size - 1)
            .toString('utf8')
          insert[data] = key
          length += _size
        }

        const _removeCount = buf.readUInt16LE(offset + length)
        length += 2

        const remove = []
        for (let i = 0; i < _removeCount; i++) {
          remove.push(buf.readUInt32LE(offset + length + 4 * i).toString())
        }
        length += 4 * _removeCount

        bundle[id] = {
          insert: insert,
          remove: remove
        }

        break
      }

      default: {
        /*
         * This error doesn't hint at an invalid type, but usually indicates
         * that the header can't be properly read, due to a shifted offset.
         * This means that the data is corrupted and can't be parsed.
         */
        throw `Unknown type ${type} encountered while parsing!`
      }
    }

    offset += length
  }

  return bundle
}
