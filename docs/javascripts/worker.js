let database;

const open = (data) => {
  let request = indexedDB.open('shibboleth', 3)
  request.onupgradeneeded = (e) => {
    let database = request.result
    let store;
    if (database.objectStoreNames.contains('domains')) {
      store = e.currentTarget.transaction.objectStore('domains')
    } else {
      store = database.createObjectStore('domains', {keyPath: 'id', autoIncrement: true})
    }
    if (!store.indexNames.contains('name')) {
      store.createIndex('name', 'name', {unique: true})
    }
    if (database.objectStoreNames.contains('settings')) {
      store = e.currentTarget.transaction.objectStore('settings')
    } else {
      store = database.createObjectStore('settings', {keyPath: 'id', autoIncrement: true})
    }
    if (!store.indexNames.contains('settings')) {
      store.createIndex('name', 'name', {unique: true})
    }
  }
  request.onblocked = (e) => {
    console.error(e)
  }
  request.onerror = (e) => {
    console.error(e)
  }
  request.onsuccess = (e) => {
    database = request.result
    self.postMessage({promiseId: data.promiseId, status: 201})
  }
}

const saveDomain = (data) => {
  let trxn = database.transaction(['domains'], 'readwrite')
  let store = trxn.objectStore('domains')
  store.add({name: data.domain})
}
const getDomains = (data) => {
  let trxn = database.transaction(['domains'])
  let store = trxn.objectStore('domains')
  store.getAll().onsuccess = (e) => {
    let records = e.target.result
    self.postMessage({promiseId: data.promiseId, result: records, status: 200})
  }
}

const removeDomain = (data) => {
  let trxn = database.transaction(['domains'], 'readwrite')
  let store = trxn.objectStore('domains')
  let request = store.delete(data.id)
  request.onsuccess = (e) => {
    self.postMessage({promiseId: data.promiseId, status: 204})
  }
}

const existingSalt = (trxn) => {
  let source = trxn.objectStore('settings').index('name')
  let findRequest = source.get('salt')
  return new Promise((resolve, reject) => {
    findRequest.onsuccess = (e) => {
      resolve(e.target.result)
    }
    findRequest.onerror = reject
  })
}
const saveSalt = async (data) => {
  let trxn = database.transaction(['settings'], 'readwrite')
  let source = trxn.objectStore('settings')
  let salt = await existingSalt(trxn)
  if (salt == null && data.value.length > 0) {
    let request = source.add({name: 'salt', value: data.value})
    request.onsuccess = (e) => {
      self.postMessage({promiseId: data.promiseId, status: 201})
    }
  }
}
const deleteSalt = async (data) => {
  let trxn = database.transaction(['settings'], 'readwrite')
  let source = trxn.objectStore('settings')
  let salt = await existingSalt(trxn)
  if (salt) {
    console.log(salt)
    let request = source.delete(salt.id)
    request.onsuccess = (e) => {
      self.postMessage({promiseId: data.promiseId, status: 204})
    }
  }
}

const getSalt = async (data) => {
  let trxn = database.transaction(['settings'])
  let salt = await existingSalt(trxn)
  let result = salt ? salt.value : null
  self.postMessage({promiseId: data.promiseId, result, status: 200})
}

self.addEventListener('message', (e) => {
  switch (e.data.cmd) {
    case 'open':
      open(e.data)
      break;
    case 'removeDomain':
      removeDomain(e.data)
      break
  }
  switch (e.data.url) {
    case '/domains':
      if (e.data.method === 'get')     { getDomains(e.data) }
      if (e.data.method === 'post')    { saveDomain(e.data) }
    case '/salt':
      if (e.data.method === 'post')    { saveSalt(e.data) }
      if (e.data.method === 'get')     { getSalt(e.data) }
      if (e.data.method === 'delete')  { deleteSalt(e.data) }
      break
  }
})

