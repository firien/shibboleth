import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as url from 'url';

import pug from 'pug';

http.createServer((request, response) => {
  let uri = url.parse(request.url).pathname
  let filePath = path.join(process.cwd(), uri)

  if (fs.existsSync(filePath)) {
    if (fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "views", "index.pug")
      let html = pug.renderFile(filePath);
      response.writeHead(200, {
        'Content-Type': "text/html",
        'Content-Length': Buffer.byteLength(html, 'utf8')
      })
      response.write(html)
      response.end()
    } else {
      let stat = fs.statSync(filePath)
      let mime = 'text/plain';
      if ((/js$/).test(filePath)) {
        mime = "text/javascript"
      } else if  ((/css$/).test(filePath)) {
        mime = "text/css"
      } else if  ((/svg$/).test(filePath)) {
        mime = "image/svg+xml"
      } else if  ((/ttf$/).test(filePath)) {
        mime = "application/x-font-ttf"
      }
      response.writeHead(200, {
        'Content-Type': mime,
        'Content-Length': stat.size
      })
      let readStream = fs.createReadStream(filePath);
      readStream.pipe(response);
    }
  }
}).listen(3008)
  