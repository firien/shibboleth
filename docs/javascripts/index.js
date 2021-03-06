import initializeCanvas from './salter.js'
import {hasher, tld} from './hasher.js'
import Modal from './modal.js'
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

let salt;
const configSalt = () => {
  if (salt) {
    document.querySelector('.salted').classList.remove('hidden')
    document.querySelector('.salted output').value = salt
    document.querySelector('.unsalted').classList.add('hidden')
  } else {
    document.querySelector('.unsalted').classList.remove('hidden')
    document.querySelector('.salted').classList.add('hidden')
    document.querySelector('.salted output').value = null
  }
}
const generatePassword = async () => {
  let domain = document.querySelector("input#domain").value
  //ios tends to insert trailing spaces
  domain = domain.trim()
  if (domain === '') {
    return
  }
  let input = document.querySelector("#shibboleth input[type=password]")
  if (!input) {
    alert("could not find password input")
    return
  }
  let password = input.value
  if (password === '') {
    return
  }
  let output = document.querySelector("#shibboleth output")
  document.querySelector('form#shibboleth').reset()
  let str = await hasher(password, domain, salt)
  // save domain
  sendMessage({url: '/domains', method: 'post', domain})
  output.value = str
  disablePasswordButtons(false)
  loadDataList()
}

const loadDataList = async () => {
  let response = await sendMessage({url: '/domains', method: 'get'})
  console.log(response)
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
const disablePasswordButtons = (bool) => {
  document.querySelector('#shibboleth button#copy').disabled = bool
  document.querySelector('#shibboleth input[type=checkbox]').disabled = bool
}
const clearPassword = () => {
  document.querySelector("#shibboleth output").value = '';
  disablePasswordButtons(true);
}
const getSalt = async () => {
  let response = await sendMessage({url: '/salt', method: 'get'})
  salt = response.result
}
const getURL = (dataTransfer) => {
  let type;
  if (dataTransfer.types.includes('text/plain')) {
    type = 'text/plain'
  } else if (dataTransfer.types.includes('text/uri-list')) {
    type = 'text/uri-list'
  }
  if (type) {
    return dataTransfer.getData(type);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  sendMessage({cmd: 'open'}).then(loadDataList).then(getSalt)
  document.querySelector('input#domain').addEventListener("input", clearPassword)
  let form = document.querySelector("form#shibboleth")
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    document.querySelector("#shibboleth input[type=password]").blur()
    return false
  }, true)
  let password = document.querySelector("#shibboleth input[type=password]")
  password.addEventListener('input', clearPassword)
  password.addEventListener('blur', generatePassword)
  password.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
      setTimeout(generatePassword, 100)
    }
  })
  document.querySelector('#domain').addEventListener('drop', (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      let uri = getURL(e.dataTransfer);
      let url = new URL(uri);
      e.target.value = tld(url);
    } catch (e) {
      e
      debugger
      //ignore
    }
  })
  document.querySelector('#domain').addEventListener('paste', (e) => {
    try {
      let uri = getURL(e.clipboardData);
      let url = new URL(uri);
      e.target.value = tld(url);
      e.stopPropagation();
      e.preventDefault();  
    } catch (e) {
      e
      debugger
      //ignore
    }
  })
  document.querySelector('#copy').addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = "copy";
    let password = String(document.querySelector('#shibboleth output').value)
    e.dataTransfer.setData('text/plain', password)
  })
  document.querySelectorAll('.copy').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      let output = e.target.parentNode.querySelector('output')
      copy(output.value)
    })
  })
  document.querySelector('#new-salt').addEventListener('click', (e) => {
    let cleanup = initializeCanvas()
    let view = document.querySelector('div.dialog')
    Modal.presentModalView(view, () => {
      cleanup()
      document.body.appendChild(view)
    });
  })
  document.querySelector('form#salt').addEventListener('submit', async function(e) {
    this.querySelector('button').disabled = true
    e.stopPropagation();
    e.preventDefault();
    await sendMessage({url: '/salt', method: 'post', value: this.salt.value})
    this.querySelector('button').disabled = false
    salt = this.salt.value
    configSalt()
    Modal.current.dismissModalView()
  })
  document.querySelector('header button').addEventListener('click', async (e) => {
    let settings = document.querySelector('#settings')
    let visible = settings.classList.toggle('expand')
    let tbody = settings.querySelector('tbody')
    if (visible) {
      document.body.classList.add('modal')
      configSalt()
      let response = await sendMessage({url: '/domains', method: 'get'})
      let template = document.querySelector('template')
      for (let record of response.result) {
        let row = template.content.cloneNode(true)
        let cell = row.querySelector('td:first-child')
        cell.textContent = record.name
        let span = row.querySelector('td span')
        span.setAttribute('data-id', record.id)
        tbody.appendChild(row)
      }
      for (let span of document.querySelectorAll('td span')) {
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
      let output = document.querySelector('#shibboleth output');
      output.value = '';
      disablePasswordButtons(true)
    }
  })
  document.querySelector('button#delete-salt').addEventListener("click", async () => {
    // need confirmation
    await sendMessage({url: '/salt', method: 'delete'})
    salt = null;
    configSalt()
  })
  // refresh button for ios webapp
  if (navigator.standalone) {
    let refresh = document.createElement('button')
    refresh.classList.add('refresh')
    refresh.textContent = '\uf105'
    document.body.appendChild(refresh)
    refresh.addEventListener('click', (e) => {
      window.location.reload()
    })
  }
  // dismiss modals on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (Modal.current) {
        Modal.current.dismissModalView();
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, {capture: true})
}, true)

let timer;
const removeMovingClass = () => {
  document.querySelector('#settings').classList.remove('moving')
}
window.addEventListener('resize', (e) => {
  document.querySelector('#settings').classList.add('moving')
  clearTimeout(timer)
  timer = setTimeout(removeMovingClass, 100)
})