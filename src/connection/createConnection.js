import {
  Socket
} from 'net'

import {
  FALLOUT_TCP_PORT
} from '../constants';

function createConnection(host) {
  const socket = new Socket()
  socket.connect(FALLOUT_TCP_PORT, host)
  return socket
}
