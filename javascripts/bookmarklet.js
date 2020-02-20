import hasher from './hasher.js'

const bookmarklet = encodeURIComponent(`(async () => {
  const localHasher = ${hasher.toString()};
  let url = window.location.hostname;
  let password = document.querySelector('input[type=password]');
  const computedPassword = await localHasher(password.value, url);
  password.value = computedPassword;
}).call()`.replace(/^ +\/\/.*\n/mg, '').replace(/\n +/mg,''))


export default bookmarklet
