export const FALLOUT_UDP_PORT = 28000
export const FALLOUT_TCP_PORT = 27000

export const channels = {
  Heartbeat: 0,
  Handshake: 1,
  Busy: 2,
  DatabaseUpdate: 3,
  LocalMapUpdate: 4,
  CommandRequest: 5,
  CommandResponse: 6
}

export const commands = {
  UseItem: 0,
  DropItem: 1,
  SetFavorite: 2,
  ToggleComponentFavorite: 3,
  SortInventory: 4,
  ToggleQuestActive: 5,
  SetCustomMapMarker: 6,
  RemoveCustomMapMarker: 7,
  CheckFastTravel: 8,
  FastTravel: 9,
  MoveLocalMap: 10,
  ZoomLocalMap: 11,
  ToggleRadioStation: 12,
  RequestLocalMapSnapshot: 13,
  ClearIdle: 14,
}
