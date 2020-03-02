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

const mostCommon = [
  'com',
  'org',
  'net',
  'edu',
  'co.uk',
  'gov',
  'mil',
]
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
    let sorted = domains.sort((a,b) => {
      return b.length - a.length;
      if (lenghtComp === 0) {
        return a.localeCompare(b)
      } else {
        return lenghtComp;
      }
    })
    let list = mostCommon.concat(sorted)
    fs.writeFileSync('./docs/javascripts/domains.js', "export const domains = " + JSON.stringify(sorted, null, 2));
  })
});

req.on('error', (e) => {
  console.log('problem with request: ' + e.message);
});

req.end();

