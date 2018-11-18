fs = require 'fs'
path = require 'path'
coffee = require 'coffeescript'

task('build', 'Build application', (options) ->
  pug = require 'pug'
  html = pug.renderFile('index.pug', pretty: true)
  filename = 'docs/index.html'
  dirname = path.dirname(filename)
  if not fs.existsSync(dirname)
    fs.mkdirSync(dirname)
  fs.writeFileSync(filename, html)
  ['service', 'pwa'].forEach((filename) ->
    cs = fs.readFileSync("#{filename}.coffee", 'utf8')
    js = coffee.compile cs
    fs.writeFileSync("docs/#{filename}.js", js)
  )
)

task('serve', 'serve', (options) ->
  watch = require 'watch'
  watch.watchTree(__dirname, interval: 0.3, ->
    try
      invoke 'build'
    catch e
      console.log e
  )

  http = require 'http'
  url = require 'url'
  http.createServer((request, response) ->
    uri = url.parse(request.url).pathname
    filename = path.join(process.cwd(), 'docs', uri)

    if fs.existsSync(filename)
      if fs.statSync(filename).isDirectory()
        filename += '/index.html'

      fs.readFile(filename, "utf8", (err, file) ->
        if err
          response.writeHead(500, "Content-Type": "text/plain")
          response.write(err + "\n")
          response.end()
          return

        ext = path.extname(filename)
        if /html/.test ext
          contentType = 'text/html'
        else if /png/.test ext
          contentType = 'image/png'
        else if /css/.test ext
          contentType = 'text/css'
        else if /js/.test ext
          contentType = 'application/javascript'
        else if /manifest/.test ext
          contentType = 'application/manifest+json'

        response.writeHead(200, "Content-Type": "#{contentType}; charset=utf-8")
        response.write(file, "utf8")
        response.end()
      )
    else
      response.writeHead(404, "Content-Type": "text/plain")
      response.write("404 Not Found\n")
      response.end()
      return
  ).listen(3010)
)
