require 'sinatra'
require 'uglifier'
require 'haml'
require 'sass'
require 'coffee-script'

require File.expand_path('../app', __FILE__)

configure(:production) do
  set :haml, { ugly: true }
end

configure(:development) do
end

root_dir = File.dirname(__FILE__)

set :root,  root_dir
set :app_file, File.join(root_dir, 'app.rb')
disable :run

use Rack::MethodOverride

FileUtils.mkdir_p 'log' unless File.exists?('log')
log = File.new('log/sinatra.log', 'a')
$stdout.reopen(log)
$stderr.reopen(log)

run Sinatra::Application
