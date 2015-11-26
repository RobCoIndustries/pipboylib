const heartbeatBuf = new Buffer([0, 0, 0, 0, 0])

export default function sendPeriodicHeartbeat(socket) {
  const interval = setInterval(() => {
    socket.write(heartbeatBuf)
  }, 1000)

  return () => {
    clearInterval(interval)
  }
}
