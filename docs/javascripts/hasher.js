const hasher = async (password, url, salt='') => {
  let limit = 22;
  //limiter?
  let match = password.match(/(.*?):(\d+)$/);
  if (match) {
    password = match[1];
    limit = Number(match[2]);
  }
  //strip sub domains (improve this)
  match = url.match(/(?:\w+\.)*?(\w+\.(?:com|gov|org|net|co\.uk|co|us|io|mil)$)/);
  if (match) {
    url = match[1];
  }
  let str = password + url + salt;
  //use first letter to determine how many times to pass through SHA256 (cap at 60 times)
  let iterations = Math.min(Math.floor(str.charCodeAt(0) / 3), 60);
  //unique password
  let encoder = new TextEncoder();
  let data = encoder.encode(str);
  for (let i=0 ; i < iterations; i++) {
    data = await crypto.subtle.digest('SHA-256', data);
  }
  //convert to base64 and then remove repeating characters
  //remove `+` and `/` and `=`
  str = new Uint8Array(data);
  str = btoa(String.fromCharCode(...str)).replace(/[\/\+=]/g, "").replace(/([a-zA-Z0-9])\1+/g, "$1");
  str = str.substring(0, limit);
  //ensure number
  if (!(/\d/).test(str)) {
    //convert last character to digit
    str = str.replace(/\w$/, r => r.charCodeAt() % 10);
  }
  return str;
}

export default hasher