# pipboylib

[![npm version](https://badge.fury.io/js/pipboylib.svg)](https://badge.fury.io/js/pipboylib) [![Join the chat at https://gitter.im/RobCoIndustries/pipboylib](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/RobCoIndustries/pipboylib?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A companion library in JavaScript for the Fallout 4 pip boy app.

![It's Close to Metal!](https://8d8dcdd952aa2708c2ff-519cda130c91226e76017ae910bdb276.ssl.cf1.rackcdn.com/close-to-metal-ba0f30d76e986ef9fa02e7fbb1c3a8a954b268777325adf87250e3f0cfc4ef17.png)

## Requirements

This is a node library, so you'll need `node` and `npm`. If, [like Nick Valentine](http://fallout.wikia.com/wiki/Close_to_Metal), you're [close to the metal](https://twitter.com/shit_hn_says/status/234856345579446272):

```
npm install pipboylib
```

In order for this library to have any utility, you'll need a running Fallout 4 game with the pip-boy app enabled. It only works on PS4 and PC at the moment (see [pipboylib#27](https://github.com/RobCoIndustries/pipboylib/issues/27)).

## Usage

```javascript
import {
  connection,
  decoding,
  status,
  constants
} from 'pipboylib'

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

```

See [examples](examples) or the Electron app, [pipboy](https://github.com/RobCoIndustries/pipboy), for more
examples.

## Protocol documentation and other clients

* [App to Server Message Spec](docs/app-msg-spec.md)
* [Server to App Message Spec](docs/server-msg-spec.md)
* [Pipboy Spec](https://github.com/mattbaker/pipboyspec)
* [Python client/server/proxy by NimVek](https://github.com/NimVek/pipboy)
* [Python client/server/proxy by Gavitron](https://github.com/Gavitron/pipulator)
* [Go client](https://github.com/nkatsaros/pipboygo)
