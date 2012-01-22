# get('/assets/pattern.svg') do
#   content_type 'image/svg+xml', charset: 'utf-8'
#   haml 'pattern.svg'.to_sym
# end

def salt
  params[:salt] ? params[:salt] : ''
end

get('/test.js') do
  content_type 'text/javascript', charset: 'utf-8'
  coffee erb 'shibboleth.js.coffee'.to_sym, locals: {bookmarklet: true, salt: salt}
end

get('/assets/shibboleth.css') do
  content_type 'text/css', charset: 'utf-8'
  scss erb('shibboleth.css.scss'.to_sym)#, style: :expanded
end

get('/bookmarklet.js') do
  content_type 'text/plain', charset: 'utf-8'
  bookmarklet = coffee erb 'shibboleth.js.coffee'.to_sym, locals: {bookmarklet: true, salt: salt}
  URI.encode('javascript:' + Uglifier.compile(bookmarklet, beautify: false))
end

get('/shibboleth.html') do
  content_type 'text/html', charset: 'utf-8'
  haml 'shibboleth.html'.to_sym, locals: {salt: salt}
end

get('/') do
  content_type 'text/html', charset: 'utf-8'
  haml 'new.html'.to_sym
end
