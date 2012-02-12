require 'sinatra/base'
require 'uglifier'
require 'haml'
require 'sass'
require 'coffee-script'

require File.expand_path('../app', __FILE__)

run App.new
