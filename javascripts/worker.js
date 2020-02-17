let $database;

const open = (data) => {
  let request = indexedDB.open('shibboleth', 1)
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
  }
  request.onblocked = (e) => {
    console.error(e)
  }
  request.onerror = (e) => {
    console.error(e)
  }
  request.onsuccess = (e) => {
    $database = request.result
    self.postMessage({promiseId: data.promiseId, status: 201})
  }
}

const saveDomain = (data) => {
  let trxn = $database.transaction(['domains'], 'readwrite')
  let store = trxn.objectStore('domains')
  store.add({name: data.domain})
}
const allDomains = (data) => {
  let trxn = $database.transaction(['domains'])
  let store = trxn.objectStore('domains')
  store.getAll().onsuccess = (e) => {
    names = e.target.result.map(d => d.name)
    self.postMessage({promiseId: data.promiseId, result: names, status: 200})
  }
}
self.addEventListener('message', (e) => {
  switch (e.data.cmd) {
    case 'open':
      open(e.data)
      break;
    case 'saveDomain':
      saveDomain(e.data)
      break
    case 'allDomains':
      allDomains(e.data)
      break;
  }
})

