export default function aggregateBundles(state = {}, newBundle) {
  state = Object.assign({}, state) // copy

  for (let key in newBundle) {
    const obj = newBundle[key]
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      if (typeof state[key] !== 'object') {
        state[key] = {}
      }

      if (typeof obj.insert === 'object') {
        for (let str in obj.insert) {
          state[key][str] = obj.insert[str]
        }
      }

      if (Array.isArray(obj.remove) && obj.remove.length > 0) {
        for (let str in state) {
          if (obj.remove.indexOf(state[str]) > -1) {
            delete state[str]
          }
        }
      }
    } else {
      state[key] = newBundle[key]
    }
  }

  return state
}
