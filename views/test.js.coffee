window.assert = (text, fn, value) ->
  error = null
  details = document.createElement 'details'
  summary = document.createElement 'summary'
  summary.appendChild(document.createTextNode(text))
  details.appendChild summary
  start = new Date().getTime()
  try
    result = fn.call()
  catch e
    error = e
  finally
    end = new Date().getTime()
  if result == value
    details.setAttribute 'class', 'pass'
  else
    details.setAttribute 'class', 'fail'
  span = document.createElement 'code'
  span.appendChild(document.createTextNode("Executed in ~#{end-start}ms"))
  if error?
    span.appendChild(document.createTextNode("#{error}"))
  details.appendChild span
  document.body.appendChild details
