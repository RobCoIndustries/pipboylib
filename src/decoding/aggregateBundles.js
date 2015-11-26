export aggregateBundles(state = {}, newBundle) {
  state = Object.assign({}, state) // copy

  for (let key in bundle) {
    const obj = bundle[key]
    if (typeof obj === "object" && !Array.isArray(obj)) {
      if (typeof state[key] !== "object") {
        state[key] = {}
      }

      if (typeof cur.insert === 'object') {
        for (let str in cur.insert) {
          state[key][str] = cur.insert[str]
        }
      }

      if (Array.isArray(cur.remove) && cur.remove.length > 0) {
        for (let str in state) {
          if (cur.remove.indexOf(state[str]) > -1) {
            delete state[str]
          }
        }
      }
    } else {
      state[key] = bundle[key]
    }
  }

  return state
}
