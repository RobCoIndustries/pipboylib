import {
  connection,
  decoding,
  status,
  constants
} from '../lib/index'

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
          .subscribe(x => {
            console.log('width: ', x.width)
            console.log('height: ', x.height)
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
