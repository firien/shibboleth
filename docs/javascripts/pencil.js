class Point {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
  distance(point) {
    return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2))
  }
  toString() {
    return Math.floor(this.x).toString(16) + Math.floor(this.y).toString(16)
  }
}
let points = []
// The drawing pencil.
class Pencil {
  constructor(context) {
    this.context = context
    this.started = false
  }

  // This is called when you start holding down the mouse button.
  // This starts the pencil drawing.
  pointerdown(ev) {
    if (points.length === 0) {
      points.push(new Point(ev._x, ev._y))
    }
    this.context.strokeStyle = "#eee"
    this.context.beginPath()
    this.context.moveTo(ev._x, ev._y)
    this.started = true
  }
  // This function is called every time you move the mouse. Obviously, it only 
  // draws if the tool.started state is set to true (when you are holding down 
  // the mouse button).
  pointermove(ev) {
    if (this.started) {
      let currentPoint = new Point(ev._x, ev._y)
      let randomSpread = 20 + Math.random() * 60
      if (points.every(p => p.distance(currentPoint) > randomSpread)) {
        points.push(currentPoint)
        this.context.save()
        this.context.beginPath()
        this.context.fillStyle = '#000'
        this.context.arc(currentPoint.x, currentPoint.y, 3, 0, Math.PI*2, true)
        this.context.closePath()
        this.context.fill()
        this.context.restore()
        this.context.beginPath()
        this.context.moveTo(ev._x, ev._y)
      }
      this.context.lineTo(ev._x, ev._y)
      this.context.stroke()
    }
  }
  // This is called when you release the mouse button.
  pointerup(ev) {
    if (this.started) {
      this.context.closePath()
      this.started = false
      this.context.clearRect(0,0,this.context.canvas.width,this.context.canvas.height)
      //are there enough points?
      if (points.length > 10) {
        //clear rect and redraw all points
        this.context.fillStyle = '#eee'//'#444'
        this.context.fillRect(0,0,this.context.canvas.width,this.context.canvas.height)
        this.context.fillStyle = '#000'
        points.forEach((p) => {
          this.context.beginPath()
          this.context.arc(p.x,p.y,3,0,Math.PI*2,true)
          this.context.closePath()
          this.context.fill()
        })
        //fill in with opacity
        this.context.fillStyle = 'rgba(123,163,200,0.8)'
        this.context.fillRect(0,0,this.context.canvas.width,this.context.canvas.height)
        //calc PRN from points
        let prn = points.slice(0,9).map(i => i.toString()).join('')
        //modal.current.dismissModalView()
        document.querySelector('.hud input').value = prn
      } else {
        points.length = 0
        alert("Not enough points retry")
      }
    }
  }
}

const initializeCanvas = () => {
  document.body.classList.add('modal')
  let canvas = document.querySelector('canvas')
  let context = canvas.getContext('2d')
  //readjust dimensions
  // context.canvas.width  = window.innerWidth - 20
  // context.canvas.height = window.innerHeight - 20

  let tool = new Pencil(context)

  // The general-purpose event handler. This function just determines the mouse
  // position relative to the canvas element.
  const ev_canvas = (ev) => {
    if (ev.offsetX || ev.offsetX === 0) {// Opera
      ev._x = ev.offsetX
      ev._y = ev.offsetY - window.pageYOffset
    } else if (ev.layerX || ev.layerX === 0) {// Firefox
      ev._x = ev.clientX - canvas.offsetLeft
      ev._y = ev.clientY - canvas.offsetTop
    }
    // Call the event handler of the tool.
    let func = tool[ev.type]
    if (func) {
      func.call(tool, ev)
    }
    return
  }

  // Attach the mousedown, mousemove and mouseup event listeners.
  canvas.addEventListener('pointerdown', ev_canvas)
  canvas.addEventListener('pointermove', ev_canvas)
  canvas.addEventListener('pointerup',   ev_canvas)
}

export default initializeCanvas
