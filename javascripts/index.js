import initializeCanvas from './pencil.js'
import hasher from './hasher.js'
import bookmarklet from './bookmarklet.js'

const worker = new Worker('/javascripts/worker.js', {name: 'shibboleth'})

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
  document.querySelector('button').disabled = false
  document.querySelector('input[type=checkbox]').disabled = false
}

const loadDataList = async () => {
  let response = await sendMessage({cmd: 'allDomains'})
  let datalist = document.querySelector('#domains')
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
}
document.addEventListener('DOMContentLoaded', () => {
  console.log(bookmarklet)
  sendMessage({cmd: 'open'}).then(loadDataList)
  let form = document.querySelector("form")
  form.addEventListener('submit', (e) => {
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
  document.querySelector('#copy').addEventListener('click', (e) => {
    let output = document.querySelector('output')
    if (navigator.clipboard) {
      navigator.clipboard.writeText(output.value)
    } else {
      let input = document.createElement('input')
      // input.style.display = 'none'
      input.style.opacity = '0'
      input.value = output.value
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
  })
  document.querySelector('#settings .title').addEventListener('click', async function(e) {
    let visible = this.parentElement.classList.toggle('expand')
    if (visible) {
      let table = document.createElement('table')
      let thead = document.createElement('thead')
      let row = document.createElement('tr')
      let cell = document.createElement('th')
      cell.textContent = 'Domains'
      row.appendChild(cell)
      thead.appendChild(row)
      table.appendChild(thead)
      let response = await sendMessage({cmd: 'allDomains'})
      let template = document.querySelector('template')
      for (let record of response.result) {
        let row = template.content.cloneNode(true)
        let cell = row.querySelector('td:first-child')
        cell.textContent = record.name
        let span = row.querySelector('td span')
        span.setAttribute('data-id', record.id)
        table.appendChild(row)
      }
      this.parentElement.appendChild(table)
      for (let span of document.querySelectorAll('span')) {
        span.addEventListener('click', removeDomain)
      }
    } else {
      let table = this.parentElement.querySelector('table')
      if (table) {
        this.parentElement.removeChild(table)
      }
    }
  })
}, true)
