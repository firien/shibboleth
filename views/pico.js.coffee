window.query = (selector) ->
  document.querySelector selector
window.queryAll = (selector) ->
  #convert NodeList to Array
  Array::slice.call document.querySelectorAll selector


Array::each = (fn) ->
  fn.call item, index for item, index in this
  return

Array::map = (fn) -> fn.call item for item in this

Array::all = (fn) ->
  all = true
  for item in this
    if not fn.call item
      all = false
      break
  return all

Element::attr = (name, value) ->
  if value? then @setAttribute(name, value) else @getAttribute(name)

Element::css = (name, value) ->
  if value? then @style[name] = value else @style[name]

Element::empty = ->
  @removeChild @firstChild while @firstChild?

Element::remove = ->
  @parentNode.removeChild this

Array::css = (name, value) ->
  @each -> this.css name, value

Array::attr = (name, value) ->
  @each -> this.attr name, value