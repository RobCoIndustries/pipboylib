import {
  Observer
} from 'rx'

export default function createObserver(socket) {
  return Observer
    .create(next => {
      socket.write(next)
    }, err => {
      socket.on('error', err)
    }, done => {
      socket.destroy()
    })
}
