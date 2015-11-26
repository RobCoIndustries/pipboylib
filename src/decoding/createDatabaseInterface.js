import generateTreeFromDatabase from './generateTreeFromDatabase'

export class Interface {
  constructor(database, id) {
    this.database = database
    this.id = id
  }

  get(key) {
    const obj = this.database[this.id]

    if (key) {
      return new Interface(this.database, obj[key])
    }

    if (Array.isArray(obj)) {
      return obj.map(id => new Interface(this.database, id))
    } else if (typeof obj === 'object') {
      const _obj = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          _obj[key] = new Interface(this.database, obj[key])
        }
      }
      return _obj;
    }

    return obj
  }

  treeify() {
    return generateTreeFromDatabase(this.database, this.id)
  }
}

export default function createDatabaseInterface(database) {
  return new Interface(database, 0)
}
