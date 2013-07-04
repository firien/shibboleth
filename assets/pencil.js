(function() {
  var CPoint, Pencil, disabler, initializeCanvas;
  CPoint = (function() {
    function CPoint(x, y) {
      this.x = x;
      this.y = y;
    }
    CPoint.prototype.distance = function(point) {
      return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    };
    CPoint.prototype.toString = function() {
      return this.x.toString(16) + this.y.toString(16);
    };
    return CPoint;
  })();
  window.CPoint = CPoint;
  Pencil = (function() {
    function Pencil(context) {
      this.context = context;
      this.started = false;
    }
    Pencil.prototype.mousedown = Pencil.prototype.touchstart = function(ev) {
      if (window.prng.length === 0) {
        window.prng.push(new CPoint(ev._x, ev._y));
      }
      this.context.strokeStyle = "#eee";
      this.context.beginPath();
      this.context.moveTo(ev._x, ev._y);
      return this.started = true;
    };
    Pencil.prototype.mousemove = Pencil.prototype.touchmove = function(ev) {
      var current_point, random_spread;
      if (this.started) {
        current_point = new CPoint(ev._x, ev._y);
        random_spread = 20 + Math.random() * 60;
        if (window.prng.all(function() {
          return this.distance(current_point) > random_spread;
        })) {
          window.prng.push(current_point);
          this.context.save();
          this.context.beginPath();
          this.context.fillStyle = '#000';
          this.context.arc(current_point.x, current_point.y, 3, 0, Math.PI * 2, true);
          this.context.closePath();
          this.context.fill();
          this.context.restore();
          this.context.beginPath();
          this.context.moveTo(ev._x, ev._y);
        }
        this.context.lineTo(ev._x, ev._y);
        return this.context.stroke();
      }
    };
    Pencil.prototype.mouseup = Pencil.prototype.touchend = Pencil.prototype.touchcancel = function(ev) {
      var canvas, p, prn, span, that;
      if (this.started) {
        this.context.closePath();
        this.started = false;
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        if (window.prng.length > 10) {
          this.context.fillStyle = '#eee';
          this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
          this.context.fillStyle = '#000';
          that = this;
          window.prng.each(function() {
            that.context.beginPath();
            that.context.arc(this.x, this.y, 3, 0, Math.PI * 2, true);
            that.context.closePath();
            return that.context.fill();
          });
          this.context.fillStyle = 'rgba(123,163,200,0.8)';
          this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
          prn = window.prng.slice(0, 9).map(function(i) {
            return i.toString();
          }).join('');
          salt_shaker(prn);
          canvas = query('.hud canvas');
          p = document.createElement('div');
          p.attr('id', 'salt-hud');
          p.css('height', canvas.height + 'px');
          p.css('width', canvas.width + 'px');
          span = document.createElement('span');
          span.css('paddingTop', "2em");
          span.css('paddingBottom', "2em");
          span.css('display', 'block');
          span.appendChild(document.createTextNode(prn));
          p.appendChild(span);
          span = document.createElement('span');
          span.appendChild(document.createTextNode('It is important that you remember this!'));
          p.appendChild(span);
          p.css('backgroundImage', "url(" + (canvas.toDataURL('image/png')) + ")");
          query('.hud').replaceChild(p, canvas);
          if ('ontouchstart' in document.documentElement) {
            return query('body').removeEventListener('touchstart', window.disabler, false);
          }
        } else {
          window.prng = [];
          return alert("Not enough points retry");
        }
      }
    };
    return Pencil;
  })();
  window.Pencil = Pencil;
  disabler = function(e) {
    e.preventDefault();
    return false;
  };
  window.disabler = disabler;
  initializeCanvas = function() {
    disabler;
    var canvas, context, ev_canvas, tool;
    if ('ontouchstart' in document.documentElement) {
      query('body').addEventListener('touchstart', window.disabler, false);
    }
    window.prng = [];
    canvas = document.querySelector('#imageView');
    context = canvas.getContext('2d');
    tool = new Pencil(context);
    ev_canvas = function(ev) {
      var func;
      if (ev.type === 'touchstart') {
        ev.preventDefault();
      }
      if ('touches' in ev) {
        if (ev.touches.length > 0) {
          if (navigator.userAgent.match(/OS 4_/)) {
            ev._x = ev.touches[0].clientX - window.pageXOffset - canvas.offsetLeft;
            ev._y = ev.touches[0].clientY - window.pageYOffset - canvas.offsetTop;
          } else {
            ev._x = ev.touches[0].clientX - canvas.offsetLeft;
            ev._y = ev.touches[0].clientY - canvas.offsetTop;
          }
        }
      } else {
        if (ev.offsetX || ev.offsetX === 0) {
          ev._x = ev.offsetX;
          ev._y = ev.offsetY - window.pageYOffset;
        } else if (ev.layerX || ev.layerX === 0) {
          ev._x = ev.clientX - canvas.offsetLeft;
          ev._y = ev.clientY - canvas.offsetTop;
        }
      }
      func = tool[ev.type];
      if (func) {
        func.call(tool, ev);
      }
    };
    if ('ontouchstart' in document.documentElement) {
      canvas.addEventListener('touchstart', ev_canvas, false);
      canvas.addEventListener('touchmove', ev_canvas, false);
      return canvas.addEventListener('touchend', ev_canvas, false);
    } else {
      canvas.addEventListener('mousedown', ev_canvas, false);
      canvas.addEventListener('mousemove', ev_canvas, false);
      return canvas.addEventListener('mouseup', ev_canvas, false);
    }
  };
  window.initializeCanvas = initializeCanvas;
}).call(this);
