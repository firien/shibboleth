require 'sinatra/base'
require 'zip/zip'

class App < Sinatra::Base

  # CONFIGURATION
  set :root, File.dirname(__FILE__)
  set :method_override, true

  configure(:production) do
    set :haml, { ugly: true }
  end

  configure(:development) do
    set :static, true

    FileUtils.mkdir_p 'log' unless File.exists?('log')
    log = File.new('log/sinatra.log', 'a')
    $stdout.reopen(log)
    $stderr.reopen(log)
    log.close
  end

  # ROUTES
  get('/assets/pattern.svg') do
    content_type 'image/svg+xml', charset: 'utf-8'
    haml 'pattern.svg'.to_sym
  end

  get('/assets/loading.svg') do
    content_type 'image/svg+xml', charset: 'utf-8'
    haml 'loading.svg'.to_sym, locals: {angle: params[:angle].to_i}
  end

  def salt
    params[:salt] ? params[:salt] : ''
  end

  get '/test.js' do
    content_type 'text/javascript', charset: 'utf-8'
    coffee erb 'shibboleth.js.coffee'.to_sym, locals: {bookmarklet: false, salt: salt, widget: false}
  end

  get '/assets/shibboleth.css' do
    content_type 'text/css', charset: 'utf-8'
    scss erb('shibboleth.css.scss'.to_sym, locals: {widget: false})#, style: :expanded
  end

  get '/bookmarklet.js' do
    content_type 'text/plain', charset: 'utf-8'
    response.headers['Access-Control-Allow-Origin'] = 'http://firien.github.com'
    bookmarklet = coffee erb 'shibboleth.js.coffee'.to_sym, locals: {bookmarklet: true, salt: salt, widget: false}
    URI.encode('javascript:' + Uglifier.compile(bookmarklet, beautify: false))
  end

  get '/shibboleth.html' do
    content_type 'text/html', charset: 'utf-8'
    haml 'shibboleth.html'.to_sym, locals: {salt: salt, widget: false}
  end

  get '/app' do
    content_type 'text/plain', charset: 'utf-8'
    response.headers['Access-Control-Allow-Origin'] = 'http://firien.github.com'
    'data:text/html;base64,'+[haml('shibboleth.html'.to_sym, locals: {salt: salt, widget: false})].pack('m0')
  end

  get '/' do
    content_type 'text/html', charset: 'utf-8'
    haml 'new.html'.to_sym
  end

  #a zipped MAC OSX Widget
  get '/widget.zip' do
    zip_file = Tempfile.new('zip')
    Zip::ZipOutputStream.open(zip_file.path) do |zip|
      #include static files
      Dir['widget/**/*'].each do |file|
        unless File.directory? file
          zip.put_next_entry(file.sub('widget/', 'Shibboleth.wdgt/'))
          zip.print File.read(file)
        end
      end
      zip.put_next_entry('Shibboleth.wdgt/images/pattern.svg')
      zip.print haml 'pattern.svg'.to_sym
      #dynamics
      zip.put_next_entry('Shibboleth.wdgt/main.css')
      zip.print scss(erb('shibboleth.css.scss'.to_sym, locals: {widget: true}))
      zip.put_next_entry('Shibboleth.wdgt/main.html')
      zip.print haml('shibboleth.html'.to_sym, locals: {salt: salt, widget: true})
      zip.put_next_entry('Shibboleth.wdgt/main.js')
      zip.print 'function shibboleth() {'
      zip.print coffee(erb('shibboleth.js.coffee'.to_sym, locals: {bookmarklet: false, salt: salt, widget: true}))
      zip.print '}'
      zip.print coffee(erb('dom.js.coffee'.to_sym, locals: {widget: true}))
    end
    send_file zip_file.path, filename: 'Shibboleth.zip', type: 'application/octet-stream'
  end

  get '/assets/pico.js' do
    content_type 'text/javascript', charset: 'utf-8'
    coffee 'pico.js'.to_sym
  end

  get '/assets/modal.js' do
    content_type 'text/javascript', charset: 'utf-8'
    coffee 'modal.js'.to_sym
  end

  get '/assets/pencil.js' do
    content_type 'text/javascript', charset: 'utf-8'
    coffee 'pencil.js'.to_sym
  end

  get '/assets/modal.css' do
    content_type 'text/css', charset: 'utf-8'
    scss 'modal.css'.to_sym
  end
end

class Numeric
  def to_radian
    self.to_f * Math::PI / 180.0
  end
end