import * as https from 'https';
import * as fs from 'fs';
import * as readline from 'readline';

// const options = {
//   host: 'raw.githubusercontent.com',
//   port: 443,
//   path: 'publicsuffix/list/master/public_suffix_list.dat',
//   method: 'GET'
// };

const options = {
  host: 'publicsuffix.org',
  path: '/list/public_suffix_list.dat',
  method: 'GET'
};

const base = (domain) => {
  let arr = domain.split('.')
  if (arr.length === 1) {
    return arr[0]
  } else {
    arr.shift()
    return arr.join('.')
  }
}

let domains = []

let req = https.request(options, (res) => {
  res.setEncoding('utf8');
  let lineReader = readline.createInterface({input: res});
  lineReader.on('line', (line) => {
    if (!line.startsWith("//") && (line.trim().length != 0)) {
      // if (!mostCommon.includes(line)) {
        domains.push(line)
      // }
    }
  });
  lineReader.on('close', () => {
    const compare = (a, b) => {
      let comp = base(a).localeCompare(base(b))
      if (comp === 0) {
        return b.length - a.length
      } else {
        return comp || a.localeCompare(b)
      }
    }
    let sorted = domains.sort(compare)
    fs.writeFileSync('./docs/javascripts/domains.js', "export const domains = " + JSON.stringify(sorted, null, 2));
  })
});

req.on('error', (e) => {
  console.log('problem with request: ' + e.message);
});

req.end();

