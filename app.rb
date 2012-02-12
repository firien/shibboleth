require 'sinatra/base'

class App < Sinatra::Base

  # CONFIGURATION
  configure(:production) do
    set :haml, { ugly: true }
  end

  configure(:development) do
    FileUtils.mkdir_p 'log' unless File.exists?('log')
    log = File.new('log/sinatra.log', 'a')
    $stdout.reopen(log)
    $stderr.reopen(log)
    log.close
  end

  set :method_override, true

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
    coffee erb 'shibboleth.js.coffee'.to_sym, locals: {bookmarklet: false, salt: salt}
  end

  get '/assets/shibboleth.css' do
    content_type 'text/css', charset: 'utf-8'
    scss erb('shibboleth.css.scss'.to_sym)#, style: :expanded
  end

  get '/bookmarklet.js' do
    content_type 'text/plain', charset: 'utf-8'
    response.headers['Access-Control-Allow-Origin'] = 'http://firien.github.com'
    bookmarklet = coffee erb 'shibboleth.js.coffee'.to_sym, locals: {bookmarklet: true, salt: salt}
    URI.encode('javascript:' + Uglifier.compile(bookmarklet, beautify: false))
  end

  get '/shibboleth.html' do
    content_type 'text/html', charset: 'utf-8'
    haml 'shibboleth.html'.to_sym, locals: {salt: salt}
  end

  get '/app' do
    content_type 'text/plain', charset: 'utf-8'
    response.headers['Access-Control-Allow-Origin'] = 'http://firien.github.com'
    'data:text/html;base64,'+[haml('shibboleth.html'.to_sym, locals: {salt: salt})].pack('m0')
  end

  get '/' do
    content_type 'text/html', charset: 'utf-8'
    haml 'new.html'.to_sym
  end

  #a zipped MAC OSX Widget
  get '/widget' do
  
  end
end

class Numeric
  def to_radian
    self.to_f * Math::PI / 180.0
  end
end