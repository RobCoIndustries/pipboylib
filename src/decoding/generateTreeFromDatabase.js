export default function generateTreeFromDatabase(db, key = 0) {
  const rec = sub => {
    if (Array.isArray(sub)) {
      return sub.map(x => rec(db[x]))
    } else if(typeof sub === 'object') {
      const res = {}
      for (let key in sub) {
        res[key] = rec(db[sub[key]])
      }
      return res
    }

    return sub
  }

  return rec(db[key])
}
