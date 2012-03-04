$ = (selector) -> document.querySelectorAll selector
window.$ = $

Array::each = NodeList::each = (fn) ->
  fn index, item for item, index in this

Array::all = NodeList::each = (fn) ->
  all = true
  for item, index in this
    if not fn index, item
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

NodeList::css = (name, value) ->
  @each (index, item) ->
    item.css name, value

NodeList::attr = (name, value) ->
  @each (index, item) ->
    item.attr name, value