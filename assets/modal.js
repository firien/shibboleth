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
      query('body').css('overflow', 'hidden');
      query('body').appendChild(container);
      setTimeout(function() {
        query('#modal').css('backgroundColor', 'rgba(0,0,0,0.65)');
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
        e.stopPropagation();
        e.preventDefault();
        window.modal.current.dismissModalView();
      }
    };
    modal.prototype.dismissModalView = function() {
      var container;
      if (this.dismissCallback != null) {
        this.dismissCallback();
      }
      window.modal.current = null;
      container = query('#modal');
      container.removeEventListener('click', this.dismiss);
      if (container != null) {
        container.empty();
        container.css('backgroundColor', 'rgba(0,0,0,0)');
        setTimeout(function() {
          document.body.setAttribute('style', "");
          document.body.removeAttribute('style');
          query('#modal').remove();
        }, 300);
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