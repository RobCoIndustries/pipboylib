import {
  Observer
} from 'rx'

import generateCommandBuffer from './generateCommandBuffer'

export default function createObserver(socket) {
  return Observer
    .create(next => {
      if (next instanceof Buffer) {
        socket.write(next)
      } else if (Array.isArray(next)) {
        socket.write(generateCommandBuffer(...next))
      }
    }, err => {
      socket.on('error', err)
    }, done => {
      socket.destroy()
    })
}
