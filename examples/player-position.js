import {
  connection,
  decoding,
  status,
  constants
} from '../lib/index'

const {
  discover,
  createSocket,
  sendPeriodicHeartbeat
} = connection

const {
  createObservable,
  parseBinaryDatabase,
  aggregateBundles,
  generateTreeFromDatabase
} = decoding

const {
  connected
} = status

const {
  channels
} = constants

discover()
  .then(server => createSocket(server.info.address))
  .then(socket => {
    sendPeriodicHeartbeat(socket)
    return createObservable(socket)
  })
  .then(observable => {
    connected(observable)
      .then(handshake => {
        console.log('Connected!', handshake)

        const database = observable
          .filter(x => x.type === channels.DatabaseUpdate)
          .map(x => parseBinaryDatabase(x.payload))
          .scan(aggregateBundles, {})
          .map(x => generateTreeFromDatabase(x))

        database
          .map(x => x.Map.World.Player)
          .map(x => ({
            x: x.X || null,
            y: x.Y || null,
            deg: x.Rotation || null
          }))
          .distinctUntilChanged()
          .subscribe(x => {
            console.log('Player Position:', x)
          })
      })
      .catch(err => {
        console.error('Couldn\'t establish connection!', err)
      })
  })
  .catch(err => {
    throw err
  })
