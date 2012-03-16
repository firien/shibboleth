(function() {
  /*
  div#modal {
    width: 100%;
    height: 100%;
    background: grey;
    background: rgba(0, 0, 0, 0);
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 2;
  }
  
  div.hud {
    font-size: 0.8em;
    background-color: white;
    margin: 10% auto 0px auto;
    border: 10px solid rgba(255, 255, 255, 0.6);
    height: auto;
    width: 410px;
    background-clip: padding-box;
    border-radius: 10px;
  }
  
  */
  var modal;
  modal = (function() {
    function modal(fn, dismissCallback) {
      var container, hud;
      this.dismissCallback = dismissCallback != null ? dismissCallback : null;
      container = document.createElement('div');
      container.attr('id', 'modal');
      $('body').css('overflow', 'hidden');
      $('body')[0].appendChild(container);
      setTimeout(function() {
        $('#modal').css('backgroundColor', 'rgba(0,0,0,0.65)');
      }, 20);
      hud = document.createElement('div');
      hud.attr('class', 'hud');
      if (navigator.userAgent.match(/OS 4_/)) {
        container.css('position', 'absolute');
        container.css('top', window.pageYOffset + 'px');
        container.css('height', '480px');
      }
      container.appendChild(hud);
      window.modal.current = this;
      container.addEventListener('click', this.dismiss);
      return hud;
    }
    modal.prototype.dismiss = function(e) {
      if ((e.currentTarget === e.srcElement) || (e.currentTarget === e.target)) {
        window.modal.current.dismissModalView();
      }
    };
    modal.prototype.dismissModalView = function() {
      var container;
      if (this.dismissCallback != null) {
        this.dismissCallback();
      }
      window.modal.current = null;
      container = $('#modal')[0];
      container.removeEventListener('click', this.dismiss);
      if (container != null) {
        container.empty();
        setTimeout((function() {
          return $('#modal')[0].remove();
        }), 300);
        container.css('backgroundColor', 'rgba(0,0,0,0)');
        $('body')[0].removeAttribute('style');
      }
      container = null;
    };
    modal.presentModalView = function(fn, dismissCallback) {
      return new modal(fn, dismissCallback);
    };
    return modal;
  })();
  window.modal = modal;
}).call(this);