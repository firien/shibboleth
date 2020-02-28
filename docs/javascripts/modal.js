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
let stack = [];

class Modal {
  constructor(element, dismissCallback=null) {
    this.dismissCallback = dismissCallback
    //TODO: check if #modal already present
    let container = document.createElement('div')
    container.setAttribute('id', 'modal')
    document.body.style.overflow = 'hidden'
    // container.css 'top', window.pageYOffset + 'px'
    document.body.appendChild(container)
    setTimeout( () => {
      document.querySelector('#modal').style.backgroundColor = 'rgba(0,0,0,0.65)';
      return
    }, 20)
    let hud = document.createElement('div')
    hud.classList.add('hud')
    container.appendChild(hud)
    stack.push(this)
    container.addEventListener('click', this.dismiss)
    hud.appendChild(element)
    return hud
  }
  dismiss(e) {
    if ((e.currentTarget === e.srcElement) || (e.currentTarget === e.target)) {
      e.stopPropagation()
      e.preventDefault()
      Modal.current.dismissModalView()
    }
    return
  }
  dismissModalView() {
    if (this.dismissCallback) {
      this.dismissCallback()
    }
    stack.pop()
    let container = document.querySelector('#modal')
    container.removeEventListener('click', this.dismiss)
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
      container.style.backgroundColor = 'rgba(0,0,0,0)'
      setTimeout(() => {
        document.body.setAttribute('style', "")
        document.body.removeAttribute('style')
        container.parentElement.removeChild(container)
        container = null
        return
      }, 300)
    return
    }
  }
  static current() {
    return stack[stack.length - 1]
  }
  static presentModalView(element, dismissCallback) {
    return new Modal(element, dismissCallback)
  }
}

export default Modal;
