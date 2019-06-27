$worker = new Worker('__worker__', name: 'wallpaper')

sendMessage = (opts, buffers) ->
  opts.promiseId = nanoid(16)
  new Promise((resolve, reject) ->
    listener = (e) ->
      if e.data.promiseId == opts.promiseId
        if /2\d\d/.test(String(e.data.status))
          resolve(e.data)
        else
          reject(e.data)
        $worker.removeEventListener('message', listener)
    $worker.addEventListener('message', listener)
    $worker.postMessage(opts, buffers)
  )


hasher = (password, url) ->
  salt = ''
  #limiter?
  limit = 22
  match = password.match /(.*?):(\d+)$/
  if match
    password = match[1]
    limit = Number match[2]
  match = null
  #strip sub domains (improve this)
  match = url.match /(?:\w+\.)*?(\w+\.(?:com|gov|org|net|co\.uk|co|us|io|mil)$)/
  url = match[1] if match
  str = password + url + salt
  #use first letter to determine how many times to pass through SHA256 (cap at 60 times)
  iterations = Math.min(Math.floor(str.charCodeAt(0) / 3), 60)
  #unique password
  encoder = new TextEncoder()
  data = encoder.encode(str)
  buf2hex = (buffer) ->
    Array::map.call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2)).join('')
  for x in [1..iterations]
    data = await crypto.subtle.digest('SHA-256', data)
    # hex and back again to support old implementation
    data = encoder.encode(buf2hex(data))
  #convert to base64 and then remove repeating characters
  #remove `+` and `/` and `=`
  str = btoa(String.fromCharCode.apply(null, new Uint8Array(data))).replace(/[\/\+=]/g, "").replace(/([a-zA-Z0-9])\1+/g, "$1")
  str = str.substring 0, limit
  #ensure number
  unless (/\d/).test str
    #convert last character to digit
    str = str.replace /\w$/, (r) -> r.charCodeAt() % 10
  return str

query = (id) -> document.querySelector id

execute = ->
  domain = query("input#domain").value
  return if domain == ''
  input = query "input[type=password]"
  unless input?
    alert "could not find password input"
    return
  password = input.value
  return if password == ''
  input = query "output"
  query('form').reset()
  str = await hasher password, domain
  # save domain
  sendMessage({cmd: 'saveDomain', domain})
  input.textContent = str


saltShaker = (salt) ->
  actions = [
    {url: 'bookmarklet.js', eid: 'salt-js'},
    {url: 'app', eid: 'salt-app'}
  ]
  actions.forEach((action, i) ->
    queryAll('#' + action.eid + ' svg').css('display', '')
    xhr = new XMLHttpRequest()
    xhr.open("GET", "#{@salter_url}" + action.url + "?salt=" + salt)
    xhr.onreadystatechange = ->
      if (xhr.readyState == 4 && xhr.status == 200)
        queryAll('#' + actions[x].eid + ' svg').css('display', 'none')
        queryAll('#' + actions[x].eid).attr('href', xhr.responseText)
        queryAll('#' + actions[x].eid + ' span').attr('class', 'salted')
    xhr.send(null)
  )
  # switch widget url
  queryAll('#widget').attr('href', '#{@salter_url}widget.zip?salt=' + salt)
  queryAll('#widget span').attr('class', 'salted')

loadDataList = ->
  sendMessage(cmd: 'allDomains').then((response) ->
    datalist = query('#domains')
    for name in response.result
      opt = document.createElement('option')
      opt.setAttribute('value', name)
      datalist.appendChild(opt)
  )

document.addEventListener('DOMContentLoaded', ->
  sendMessage(cmd: 'open').then(loadDataList)
  f = query "form"
  f.addEventListener('submit', (e) ->
    e.preventDefault()
    query("input[type=password]").blur()
    return false
  , true)
  t = query("input[type=password]")
  t.addEventListener 'blur', (e) ->
    console.time('sha')
    execute()
    console.timeEnd('sha')
  t.addEventListener 'keyup', (e) ->
    if (e.keyCode == 13)
      setTimeout( ->
        query("input[type=password]").blur()
      , 100)
  query('#sprinkle')?.addEventListener('click', (e) ->
    hud = modal.presentModalView()
    canvas = document.createElement('canvas')
    canvas.attr('id', 'imageView')
    hud.appendChild(canvas)
    canvas.width = hud.clientWidth
    canvas.height = hud.clientHeight
    p = document.createElement('p')
    if ('ontouchstart' in document.documentElement)
      p.appendChild(document.createTextNode('Scribble Above With Finger'))
    else
      p.appendChild(document.createTextNode('Hold Down Left Mouse Button & Scribble Above'))
    hud.appendChild(p)
    p = document.createElement('p')
    p.appendChild(document.createTextNode('To Generate Salt'))
    hud.appendChild(p)
    window.initializeCanvas()
    e.preventDefault()
    return false
  , false)
  query('#known-salt')?.addEventListener('click', (e) ->
    s = prompt('Salt')
    if (s != "" && s != null)
      window.salt_shaker(s)
    e.stopPropagation()
    e.preventDefault()
    return false
  , true)
  query('#show-source')?.addEventListener('click', (e) ->
    hud = modal.presentModalView()
    list = document.createElement('ol')
    list_item = document.createElement('li')
    anchor = document.createElement('a')
    anchor.setAttribute('href', '#removethis_' + query('#salt-js').attr('href'))
    anchor.appendChild(document.createTextNode('Click on this link'))
    list_item.appendChild(anchor)
    list.appendChild(list_item)
    ['Bookmark the Page', 'Edit Bookmark: Remove everything preceding `javascript:…`'].forEach((text) ->
      list_item = document.createElement('li')
      list_item.appendChild(document.createTextNode(text))
      list.appendChild(list_item)
    )
    hud.appendChild(list)
    e.stopPropagation()
    e.preventDefault()
    return false
  , true)
, true)
