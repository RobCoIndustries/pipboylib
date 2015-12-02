import dgram from 'dgram'

import {
  FALLOUT_UDP_PORT
} from '../constants'

import createDiscovery from './createDiscovery'

const AUTODISCOVERY_PAYLOAD = '{"cmd":"autodiscover"}'

export default function discover() {
  return createDiscovery()
    .first()
    .toPromise()
}
