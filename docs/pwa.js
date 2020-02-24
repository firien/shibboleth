if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/shibboleth/service.js', {scope: '/shibboleth/'}).then((registration) => {
    const refreshPage = (worker) => {
      if (worker.state !== 'activated') {
        worker.postMessage({action: 'skipWaiting'})
      }
      window.location.reload()
    }
    if (registration.waiting) {
      refreshPage(registration.waiting)
    }
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          refreshPage(newWorker)
        }
      })
    })
  })
}

window.addEventListener('beforeinstallprompt', (e) => {
  // necessary?
  e.preventDefault()
  let deferredInstall = e
  let button = document.createElement('button')
  button.setAttribute('id', 'installer')
  button.textContent = 'Install'
  button.addEventListener('click', () => {
    deferredInstall.prompt()
    deferredInstall.userChoice.finally(() => {
      deferredInstall = null
      document.body.removeChild(button)
    })
  })
  document.body.appendChild(button)
})
