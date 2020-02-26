const tag = 4;
const prefix = 'SHIBBOLETH';
const cacheName = `${prefix}-${tag}`

const urls = [
  '/shibboleth/javascripts/bookmarklet.js',
  '/shibboleth/javascripts/index.js',
  '/shibboleth/javascripts/copy.js',
  '/shibboleth/javascripts/hasher.js',
  '/shibboleth/javascripts/modal.js',
  '/shibboleth/javascripts/pencil.js',
  '/shibboleth/javascripts/worker.js',
  '/shibboleth/stylesheets/index.css',
  '/shibboleth/images/icon-152.png',
  '/shibboleth/images/icon-167.png',
  '/shibboleth/images/icon-180.png',
  '/shibboleth/images/icon-192.png',
  '/shibboleth/images/icon-512.png',
  '/shibboleth/fonts/font.ttf',
  '/shibboleth/fonts/font.woff2',
  '/shibboleth/fonts/font.svg',
  '/shibboleth/pwa.js',
  '/shibboleth/manifest.webmanifest',
  '/shibboleth/index.html',
  '/shibboleth/',
]

self.addEventListener('install', (event) => {
  return event.waitUntil(caches.open(cacheName).then((cache) => {
    return cache.addAll(urls)
  }))
})

const clearPreviousCaches = () => {
  return caches.keys().then((keys) => {
    return Promise.all(keys.filter((key) => {
      return (key != cacheName) && key.startsWith(prefix)
    }).map(key => caches.delete(key)))
  })
}

self.addEventListener('activate', (event) => {
  return event.waitUntil(clearPreviousCaches())
})

self.addEventListener('fetch', (event) => {
  return event.respondWith(
    caches.open(cacheName).then((cache) => {
      return cache.match(event.request, {ignoreSearch: true})
    }).then((response) => {
      return response || fetch(event.request)
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    return self.skipWaiting()
  }
})
