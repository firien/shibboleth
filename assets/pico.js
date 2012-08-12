(function() {
  window.query = function(selector) {
    return document.querySelector(selector);
  };
  window.queryAll = function(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  };
  Array.prototype.each = function(fn) {
    var index, item, _len;
    for (index = 0, _len = this.length; index < _len; index++) {
      item = this[index];
      fn.call(item, index);
    }
  };
  Array.prototype.map = function(fn) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      item = this[_i];
      _results.push(fn.call(item));
    }
    return _results;
  };
  Array.prototype.all = function(fn) {
    var all, item, _i, _len;
    all = true;
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      item = this[_i];
      if (!fn.call(item)) {
        all = false;
        break;
      }
    }
    return all;
  };
  Element.prototype.attr = function(name, value) {
    if (value != null) {
      return this.setAttribute(name, value);
    } else {
      return this.getAttribute(name);
    }
  };
  Element.prototype.css = function(name, value) {
    if (value != null) {
      return this.style[name] = value;
    } else {
      return this.style[name];
    }
  };
  Element.prototype.empty = function() {
    var _results;
    _results = [];
    while (this.firstChild != null) {
      _results.push(this.removeChild(this.firstChild));
    }
    return _results;
  };
  Element.prototype.remove = function() {
    return this.parentNode.removeChild(this);
  };
  Array.prototype.css = function(name, value) {
    return this.each(function() {
      return this.css(name, value);
    });
  };
  Array.prototype.attr = function(name, value) {
    return this.each(function() {
      return this.attr(name, value);
    });
  };
}).call(this);