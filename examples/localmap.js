import {
  connection,
  decoding,
  status,
  constants
} from '../lib/index';

import * as fs from 'fs';

const {
  discover,
  createSocket,
  sendPeriodicHeartbeat,
  createConnectionSubject
} = connection

const {
  createObservable,
  parseBinaryDatabase,
  aggregateBundles,
  generateTreeFromDatabase,
  parseBinaryMap
} = decoding

const {
  connected
} = status

const {
  channels,
  commands
} = constants

discover()
  .then(server => createSocket(server.info.address))
  .then(socket => {
    sendPeriodicHeartbeat(socket)
    return createConnectionSubject(socket)
  })
  .then(subject => {
    connected(subject)
      .then(handshake => {
        console.log('Connected!', handshake)

        const localMap = subject
          .filter(x => x.type === channels.LocalMapUpdate)
          .map(x => parseBinaryMap(x.payload))

        localMap
          .distinctUntilChanged()
          .subscribe(map => {
            // We could write the file out as a PNG or JPEG if we wanted.
            // We'll write a file out as PGM directly so we don't
            // need a dependency for this example.
            //
            // If you don't have a viewer for PGM but have imagemagick, run
            //   convert localmap.pgm localmap.png

            var imageFile = fs.createWriteStream('localmap.pgm', {
                flags: 'w',
                defaultEncoding: 'binary',
                mode: 0o666
            })

            imageFile.write(`P5 ${map.width} ${map.height} 255\n ${map.pixels.toString('binary')}`)
            console.log('Wrote file');
          })

        subject.observer.onNext(['RequestLocalMapSnapshot'])
      })
      .catch(err => {
        console.error('Couldn\'t establish connection!', err);
        console.error(err.stack);
      })
  })
  .catch(err => {
    throw err
  })
