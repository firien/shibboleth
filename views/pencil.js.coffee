class CPoint
  constructor: (@x,@y) ->
  distance: (point) ->
    Math.sqrt Math.pow(@x-point.x,2) + Math.pow(@y-point.y,2)
  toString: ->
    @x.toString(16) + @y.toString(16)
window.CPoint = CPoint

# The drawing pencil.
class Pencil
  constructor: (@context) ->
    @started = false

  # This is called when you start holding down the mouse button.
  # This starts the pencil drawing.
  Pencil::mousedown = Pencil::touchstart = (ev) ->
    if window.prng.length == 0
      window.prng.push new CPoint(ev._x, ev._y)
    @context.strokeStyle = "#eee"
    @context.beginPath()
    @context.moveTo(ev._x, ev._y)
    @started = true

  # This function is called every time you move the mouse. Obviously, it only 
  # draws if the tool.started state is set to true (when you are holding down 
  # the mouse button).
  Pencil::mousemove = Pencil::touchmove = (ev) ->
    if @started
      current_point = new CPoint(ev._x, ev._y)
      random_spread = 20 + Math.random() * 60
      if window.prng.all(-> this.distance(current_point) > random_spread)
        window.prng.push current_point
        @context.save()
        @context.beginPath()
        @context.fillStyle = '#000'
        @context.arc(current_point.x,current_point.y,3,0,Math.PI*2,true)
        @context.closePath()
        @context.fill()
        @context.restore()
        @context.beginPath()
        @context.moveTo(ev._x, ev._y)
      @context.lineTo(ev._x, ev._y)
      @context.stroke()

  # This is called when you release the mouse button.
  Pencil::mouseup = Pencil::touchend = Pencil::touchcancel = (ev) ->
    if @started
      # @mousemove ev
      @context.closePath()
      @started = false
      @context.clearRect(0,0,@context.canvas.width,@context.canvas.height)
      #are there enough points?
      if window.prng.length > 10
        #clear rect and redraw all points
        @context.fillStyle = '#eee'#'#444'
        @context.fillRect(0,0,@context.canvas.width,@context.canvas.height)
        @context.fillStyle = '#000'
        that = this
        window.prng.each ->
          that.context.beginPath()
          that.context.arc(this.x,this.y,3,0,Math.PI*2,true)
          that.context.closePath()
          that.context.fill()
        #fill in with opacity
        @context.fillStyle = 'rgba(123,163,200,0.8)'
        @context.fillRect(0,0,@context.canvas.width,@context.canvas.height)
        #calc PRN from points
        prn = window.prng.slice(0,9).map(-> this.toString()).join('')
        #console.log prn
        salt_shaker prn
        #window.modal.current.dismissModalView()
        
        canvas = $('.hud canvas')[0]
        p = document.createElement 'div'
        p.attr 'id', 'salt-hud'
        p.css 'height', canvas.height + 'px'
        p.css 'width', canvas.width + 'px'
        p.css 'lineHeight', canvas.height + 'px'
        p.appendChild document.createTextNode prn
        p.css 'backgroundImage', "url(#{canvas.toDataURL('image/png')})"
        $('.hud')[0].replaceChild p, canvas
        
        if `'ontouchstart' in document.documentElement`
          $('body')[0].removeEventListener('touchstart', window.disabler, false)
        #for quatto
        #window.prng = []
        #setTimeout((-> that.context.clearRect(0,0,that.context.canvas.width,that.context.canvas.height)), 2000)
      else
        window.prng = []
        alert "Not enough points retry"
window.Pencil = Pencil

disabler = (e) ->
  e.preventDefault()
  return false

window.disabler = disabler

initializeCanvas = ->
  disabler
  #disable scrolling on touch devices
  if `'ontouchstart' in document.documentElement`
    $('body')[0].addEventListener('touchstart', window.disabler, false)
  window.prng = []

  canvas = document.querySelector '#imageView'
  context = canvas.getContext '2d'
  #readjust dimensions
  # context.canvas.width  = window.innerWidth - 20
  # context.canvas.height = window.innerHeight - 20

  tool = new Pencil(context)

  # The general-purpose event handler. This function just determines the mouse 
  # position relative to the canvas element.
  ev_canvas = (ev) ->
    ev.preventDefault() if ev.type == 'touchstart'
    if `'touches' in ev`
      if ev.touches.length > 0
        ev._x = ev.touches[0].clientX - canvas.offsetLeft
        ev._y = ev.touches[0].clientY - canvas.offsetTop
    else
      if (ev.offsetX || ev.offsetX == 0)# Opera
        ev._x = ev.offsetX
        ev._y = ev.offsetY - window.pageYOffset
      else if (ev.layerX || ev.layerX == 0)# Firefox
        ev._x = ev.clientX - canvas.offsetLeft
        ev._y = ev.clientY - canvas.offsetTop

    # Call the event handler of the tool.
    func = tool[ev.type]
    func.call(tool, ev) if func
    return

  if `'ontouchstart' in document.documentElement`
    canvas.addEventListener('touchstart', ev_canvas, false)
    canvas.addEventListener('touchmove', ev_canvas, false)
    canvas.addEventListener('touchend',   ev_canvas, false)
  else
    # Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false)
    canvas.addEventListener('mousemove', ev_canvas, false)
    canvas.addEventListener('mouseup',   ev_canvas, false)
window.initializeCanvas = initializeCanvas