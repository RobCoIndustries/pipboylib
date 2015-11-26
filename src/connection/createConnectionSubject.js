import {
  Subject
} from 'rx'

import createObserver from '../encoding/createObserver'
import createObservable from '../decoding/createObservable'

export default function createConnectionSubject(socket) {
  const observer = createObserver(socket)
  const observable = createObservable(socket)
  return Subject.create(observer, observable)
}
