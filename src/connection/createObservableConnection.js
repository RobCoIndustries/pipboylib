import {
  Observable
} from "rx";

import createDataStream from '../decoding/createDataStream'

export default function createObservableConnection(socket) {
  const parser = createDataStream()
  return Observable
    .create(observer => {
      socket.pipe(parser)

      socket.on("error", err => {
        observer.onError(err);
      })

      socket.on("end", () => {
        observer.onCompleted();
      })

      parser.on("readable", () => {
        let payload;
        while (payload = parser.read()) {
          observer.onNext(payload);
        }
      })
    })
    .publish()
    .refCount()
}
