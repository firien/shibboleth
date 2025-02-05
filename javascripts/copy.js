const copy = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
  } else {
    let input = document.createElement('textarea')
    // input.style.display = 'none'
    input.style.opacity = '0'
    input.value = text
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }
}

export default copy
