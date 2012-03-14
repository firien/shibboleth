###
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

###
class modal
  constructor: (fn, @dismissCallback=null) ->
    #TODO: check if #modal already present
    container = document.createElement 'div'
    container.attr 'id', 'modal'
    $('body').css 'overflow', 'hidden'
    # container.css 'top', window.pageYOffset + 'px'
    $('body')[0].appendChild container
    setTimeout( ->
      $('#modal').css 'backgroundColor', 'rgba(0,0,0,0.65)'
      return
    , 20)
    hud = document.createElement 'div'
    hud.attr 'class', 'hud'
    container.appendChild hud
    window.modal.current = this
    container.addEventListener 'click', @dismiss
    return hud
  dismiss: (e) ->
    if (e.currentTarget == e.srcElement) || (e.currentTarget == e.target)
      window.modal.current.dismissModalView()
      return
  dismissModalView: ->
    @dismissCallback() if @dismissCallback?
    window.modal.current = null
    container = $('#modal')[0]
    container.removeEventListener 'click', @dismiss
    if container?
      container.empty()
      setTimeout(( -> $('#modal')[0].remove()), 300)
      container.css 'backgroundColor', 'rgba(0,0,0,0)'
      $('body')[0].removeAttribute 'style'
    container = null
    return
  @presentModalView = (fn, dismissCallback) ->
    return new modal fn, dismissCallback
window.modal = modal
