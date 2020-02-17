disabler = (e) ->
  e.preventDefault()
  return false

class Point
  constructor: (@x,@y) ->
  distance: (point) ->
    Math.sqrt Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2)
  toString: ->
    this.x.toString(16) + this.y.toString(16)

# The drawing pencil.
class Pencil
  constructor: (@context) ->
    this.started = false

  # This is called when you start holding down the mouse button.
  # This starts the pencil drawing.
  pointerdown: (ev) ->
    if window.prng.length == 0
      window.prng.push new Point(ev._x, ev._y)
    this.context.strokeStyle = "#eee"
    this.context.beginPath()
    this.context.moveTo(ev._x, ev._y)
    this.started = true

  # This function is called every time you move the mouse. Obviously, it only 
  # draws if the tool.started state is set to true (when you are holding down 
  # the mouse button).
  pointermove: (ev) ->
    if this.started
      current_point = new Point(ev._x, ev._y)
      random_spread = 20 + Math.random() * 60
      if window.prng.every((p)-> p.distance(current_point) > random_spread)
        window.prng.push current_point
        this.context.save()
        this.context.beginPath()
        this.context.fillStyle = '#000'
        this.context.arc(current_point.x,current_point.y,3,0,Math.PI*2,true)
        this.context.closePath()
        this.context.fill()
        this.context.restore()
        this.context.beginPath()
        this.context.moveTo(ev._x, ev._y)
      this.context.lineTo(ev._x, ev._y)
      this.context.stroke()

  # This is called when you release the mouse button.
  pointerup: (ev) ->
    if this.started
      # @mousemove ev
      this.context.closePath()
      this.started = false
      this.context.clearRect(0,0,this.context.canvas.width,this.context.canvas.height)
      #are there enough points?
      if window.prng.length > 10
        #clear rect and redraw all points
        this.context.fillStyle = '#eee'#'#444'
        this.context.fillRect(0,0,this.context.canvas.width,this.context.canvas.height)
        this.context.fillStyle = '#000'
        window.prng.forEach((p) ->
          this.context.beginPath()
          this.context.arc(p.x,p.y,3,0,Math.PI*2,true)
          this.context.closePath()
          this.context.fill()
        , this)
        #fill in with opacity
        this.context.fillStyle = 'rgba(123,163,200,0.8)'
        this.context.fillRect(0,0,this.context.canvas.width,this.context.canvas.height)
        #calc PRN from points
        prn = window.prng.slice(0,9).map((i)-> i.toString()).join('')
        salt_shaker prn
        #window.modal.current.dismissModalView()
        
        canvas = query '.hud canvas'
        p = document.createElement 'div'
        p.attr 'id', 'salt-hud'
        p.css 'height', canvas.height + 'px'
        p.css 'width', canvas.width + 'px'
        # p.css 'lineHeight', canvas.height + 'px'
        span = document.createElement 'span'
        span.css 'paddingTop', "2em"
        span.css 'paddingBottom', "2em"
        span.css 'display', 'block'
        span.appendChild document.createTextNode prn
        p.appendChild span
        #append instructions
        span = document.createElement 'span'
        span.appendChild document.createTextNode('It is important that you remember this!')
        p.appendChild span
        p.css 'backgroundImage', "url(#{canvas.toDataURL('image/png')})"
        query('.hud').replaceChild p, canvas

        if 'ontouchstart' of document.documentElement
          query('body').removeEventListener('touchstart', disabler, false)
      else
        window.prng = []
        alert "Not enough points retry"

initializeCanvas = ->
  #disable scrolling on touch devices
  if 'ontouchstart' of document.documentElement
    query('body').addEventListener('touchstart', disabler, false)
  window.prng = []

  canvas = document.querySelector 'canvas#imageView'
  context = canvas.getContext '2d'
  #readjust dimensions
  # context.canvas.width  = window.innerWidth - 20
  # context.canvas.height = window.innerHeight - 20

  tool = new Pencil(context)

  # The general-purpose event handler. This function just determines the mouse
  # position relative to the canvas element.
  ev_canvas = (ev) ->
    if (ev.offsetX || ev.offsetX == 0)# Opera
      ev._x = ev.offsetX
      ev._y = ev.offsetY - window.pageYOffset
    else if (ev.layerX || ev.layerX == 0)# Firefox
      ev._x = ev.clientX - canvas.offsetLeft
      ev._y = ev.clientY - canvas.offsetTop

    # Call the event handler of the tool.
    func = tool[ev.type]
    func?.call(tool, ev)
    return

  # Attach the mousedown, mousemove and mouseup event listeners.
  canvas.addEventListener('pointerdown', ev_canvas)
  canvas.addEventListener('pointermove', ev_canvas)
  canvas.addEventListener('pointerup',   ev_canvas)

window.initializeCanvas = initializeCanvas
