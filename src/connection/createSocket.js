import {
  Socket
} from 'net'

import {
  FALLOUT_TCP_PORT
} from '../constants';

export default function createSocket(host) {
  const socket = new Socket()
  socket.connect(FALLOUT_TCP_PORT, host)
  return socket
}
