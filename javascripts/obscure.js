class Obscure extends HTMLElement {
  constructor() {
    super()
    let shadow = this.attachShadow({mode: 'closed'})
    let style = document.createElement('style');
    style.textContent = `
      output {
        background-color: var(--background-color);
        border-radius: inherit;
      }
      output, label, button {
        font-family: Shibboleth;
        line-height: 3rem;
      }
      input[type=checkbox] {
        display: none;
      }
      input:checked + output {
        font-family: Menlo, Tahoma;
      }
      button, label {
        font-family: Shibboleth;
        font-size: 1.5rem;
        width: 3rem;
        -webkit-appearance: none;
        appearance: none;
        border: none;
        background-color: transparent;
        cursor: pointer;
        color: var(--text-color);
      }
      input:disabled ~ label, button:disabled {
        color: grey;
      }
    `
    shadow.appendChild(style)
    this.peeker = document.createElement('input')
    this.peeker.id = 'peek'
    this.peeker.type = 'checkbox'
    this.peeker.disabled = true
    shadow.appendChild(this.peeker)
    this.output = document.createElement('output')
    shadow.appendChild(this.output)
    let label = document.createElement('label')
    label.title = 'View'
    label.textContent = '\uF100'
    label.setAttribute('for', 'peek')
    shadow.appendChild(label)
    this.button = document.createElement('button')
    this.button.title = 'Copy'
    this.button.textContent = '\uF101'
    this.button.disabled = true
    this.button.draggable = true
    shadow.appendChild(this.button)
  }
  set value(val) {
    this.output.value = val
    this.peeker.disabled = val.length < 1
    this.button.disabled = val.length < 1
  }
}

customElements.define('obscure-output', Obscure);
