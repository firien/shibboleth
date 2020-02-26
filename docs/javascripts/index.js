import initializeCanvas from './pencil.js'
import {hasher, tld} from './hasher.js'
import {bookmarklet, shortcut} from './bookmarklet.js'
import modal from './modal.js'
import copy from './copy.js'

const worker = new Worker('/shibboleth/javascripts/worker.js', {name: 'shibboleth'})

let messageCount = 0
const sendMessage = (opts, buffers) => {
  opts.promiseId = messageCount++
  return new Promise((resolve, reject) => {
    const listener = (e) => {
      if (e.data.promiseId === opts.promiseId) {
        if ((/2\d\d/).test(String(e.data.status))) {
          resolve(e.data)
        } else {
          reject(e.data)
        }
        worker.removeEventListener('message', listener)
      }
    }
    worker.addEventListener('message', listener)
    worker.postMessage(opts, buffers)
  })
}

const execute = async () => {
  let domain = document.querySelector("input#domain").value
  if (domain === '') {
    return
  }
  let input = document.querySelector("input[type=password]")
  if (!input) {
    alert("could not find password input")
    return
  }
  let password = input.value
  if (password === '') {
    return
  }
  let output = document.querySelector("output")
  document.querySelector('form').reset()
  let str = await hasher(password, domain)
  // save domain
  sendMessage({cmd: 'saveDomain', domain})
  output.textContent = str
  document.querySelector('button#copy').disabled = false
  document.querySelector('input[type=checkbox]').disabled = false
  loadDataList()
}

document.querySelector('#domain').addEventListener('drop', (e) => {
  e.stopPropagation();
  e.preventDefault();
  try {
    let uri = e.dataTransfer.getData("text/uri-list");
    let url = new URL(uri);
    e.target.value = tld(url);
  } catch (e) {
    e
    debugger
    //ignore
  }
})
const loadDataList = async () => {
  let response = await sendMessage({cmd: 'allDomains'})
  let datalist = document.querySelector('#domains')
  while (datalist.firstChild) {
    datalist.removeChild(datalist.firstChild)
  }
  for (let record of response.result) {
    let opt = document.createElement('option')
    opt.setAttribute('value', record.name)
    datalist.appendChild(opt)
  }
}
const removeDomain = async function(e) {
  let id = Number(this.getAttribute('data-id'))
  let response = await sendMessage({cmd: 'removeDomain', id})
  if (Number(response.status) === 204) {
    let tr = e.target.parentElement.parentElement
    tr.parentElement.removeChild(tr)
  }
  loadDataList()
}
document.addEventListener('DOMContentLoaded', () => {
  sendMessage({cmd: 'open'}).then(loadDataList)
  let form = document.querySelector("form")
  form.addEventListener('submit', (e) => {
    console.log("submitted")
    e.preventDefault()
    document.querySelector("input[type=password]").blur()
    return false
  }, true)
  let password = document.querySelector("input[type=password]")
  password.addEventListener('blur', (e) => {
    console.time('sha')
    execute()
    console.timeEnd('sha')
  })
  password.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
      setTimeout( () => {
        document.querySelector("input[type=password]").blur()
      }, 100)
    }
  })
  // initializeCanvas()
  document.querySelector('#copy').addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = "copy";
    let password = document.querySelector('output').value
    e.dataTransfer.setData('text', password)
  })
  document.querySelector('#copy').addEventListener('click', (e) => {
    e.preventDefault()
    let output = document.querySelector('output')
    copy(output.value)
  })
  document.querySelector('a#bookmarklet').href = `javascript:${bookmarklet}`
  document.querySelector('button#shortcuts').addEventListener('click', (e) => {
    copy(shortcut)
  })
  document.querySelector('#salt').addEventListener('click', (e) => {
    initializeCanvas()
    let hud = modal.presentModalView(null)
    hud.appendChild(document.querySelector('canvas'))
  })

  document.querySelector('header button').addEventListener('click', async (e) => {
    let settings = document.querySelector('#settings')
    let visible = settings.classList.toggle('expand')
    let tbody = settings.querySelector('tbody')
    if (visible) {
      document.body.classList.add('modal')
      let response = await sendMessage({cmd: 'allDomains'})
      let template = document.querySelector('template')
      for (let record of response.result) {
        let row = template.content.cloneNode(true)
        let cell = row.querySelector('td:first-child')
        cell.textContent = record.name
        let span = row.querySelector('td span')
        span.setAttribute('data-id', record.id)
        tbody.appendChild(row)
      }
      for (let span of document.querySelectorAll('span')) {
        span.addEventListener('click', removeDomain)
      }
    } else {
      document.body.classList.remove('modal')
      while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild)
      }
    }
  })
  document.addEventListener('visibilitychange', (e) => {
    if (document.hidden) {
      let output = document.querySelector('output');
      output.value = '';
      document.querySelector('button#copy').disabled = true
      document.querySelector('input[type=checkbox]').disabled = true
        }
  })
}, true)
