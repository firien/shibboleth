import initializeCanvas from './pencil.js'

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


const hasher = async (password, url) => {
  let salt = ''
  //limiter?
  let limit = 22
  let match = password.match(/(.*?):(\d+)$/)
  if (match) {
    password = match[1]
    limit = Number(match[2])
  }
  //strip sub domains (improve this)
  match = url.match(/(?:\w+\.)*?(\w+\.(?:com|gov|org|net|co\.uk|co|us|io|mil)$)/)
  if (match) {
    url = match[1]
  }
  let str = password + url + salt
  //use first letter to determine how many times to pass through SHA256 (cap at 60 times)
  let iterations = Math.min(Math.floor(str.charCodeAt(0) / 3), 60)
  //unique password
  let encoder = new TextEncoder()
  let data = encoder.encode(str)
  for (let i=0 ; i < iterations; i++) {
    data = await crypto.subtle.digest('SHA-256', data)
    // hex and back again to support old implementation
    data = encoder.encode(data)
  }
  //convert to base64 and then remove repeating characters
  //remove `+` and `/` and `=`
  str = btoa(String.fromCharCode.apply(null, new Uint8Array(data))).replace(/[\/\+=]/g, "").replace(/([a-zA-Z0-9])\1+/g, "$1")
  str = str.substring(0, limit)
  //ensure number
  if (!(/\d/).test(str)) {
    //convert last character to digit
    str = str.replace(/\w$/, r => r.charCodeAt() % 10)
  }
  return str
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
  for (let name of response.result) {
    let opt = document.createElement('option')
    opt.setAttribute('value', name)
    datalist.appendChild(opt)
  }
}
document.addEventListener('DOMContentLoaded', () => {
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
      // window.getSelection().removeAllRanges()
      // range = document.createRange()
      // range.selectNodeContents(output)
      // range.collapse(true)
      // range.setStart(output, 0)
      // range.setEnd(output, 0)
      // window.getSelection().addRange(range)
      // window.getSelection().collapse(output)
      // window.getSelection().extend(output, 4)
      // window.getSelection().selectAllChildren(output)
      document.execCommand('copy')
      // window.getSelection().removeAllRanges()
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
      for (let domain of response.result) {
        let row = document.createElement('tr')
        let cell = document.createElement('td')
        cell.textContent = domain
        row.appendChild(cell)
        table.appendChild(row)
      }
      this.parentElement.appendChild(table)
    } else {
      let table = this.parentElement.querySelector('table')
      if (table) {
        this.parentElement.removeChild(table)
      }
    }
  })
}, true)
