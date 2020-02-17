$database = null

open = (data) ->
  request = indexedDB.open('shibboleth', 1)
  request.onupgradeneeded = (e) ->
    database = request.result
    if database.objectStoreNames.contains('domains')
      store = e.currentTarget.transaction.objectStore('domains')
    else
      store = database.createObjectStore('domains', keyPath: 'id', autoIncrement: true)
    if not store.indexNames.contains('name')
      store.createIndex('name', 'name', unique: true)
  request.onblocked = (e) ->
    console.error e
  request.onerror = (e) ->
    console.error e
  request.onsuccess = (e) ->
    $database = request.result
    self.postMessage(promiseId: data.promiseId, status: 201)

saveDomain = (data) ->
  trxn = $database.transaction(['domains'], 'readwrite')
  store = trxn.objectStore('domains')
  store.add(name: data.domain)

allDomains = (data) ->
  trxn = $database.transaction(['domains'])
  store = trxn.objectStore('domains')
  store.getAll().onsuccess = (e) ->
    names = e.target.result.map((d) => d.name)
    self.postMessage(promiseId: data.promiseId, result: names, status: 200)

self.addEventListener('message', (e) ->
  switch e.data.cmd
    when 'open'          then open(e.data)
    when 'saveDomain'    then saveDomain(e.data)
    when 'allDomains'    then allDomains(e.data)
)

