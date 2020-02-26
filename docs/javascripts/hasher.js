//strip sub domains (improve this)
export const tld = (url) => {
  if (url.constructor === URL) {
    let hostname = url.hostname
    let match = hostname.match(/(?:\w+\.)*?(\w+\.(?:com|gov|org|net|co\.uk|co|us|io|mil)$)/);
    if (match) {
      return match[1];
    } else {
      return hostname
    }
  } else {
    return url
  }
}

export const hasher = async (password, url, salt='') => {
  let limit = 22;
  //limiter?
  let match = password.match(/(.*?):(\d+)$/);
  if (match) {
    password = match[1];
    limit = Number(match[2]);
  }
  let str = password + tld(url) + salt;
  let iterations = str.charCodeAt(0) * 20
  let encoder = new TextEncoder();
  let data = encoder.encode(str);
  for (let i=0 ; i < iterations; i++) {
    data = await crypto.subtle.digest('SHA-512', data);
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

