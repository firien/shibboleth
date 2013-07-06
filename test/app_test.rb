gem "minitest"
require File.expand_path('../../app.rb', __FILE__)
require 'minitest'
require 'minitest/test'
require 'minitest/autorun'
require 'rack/test'

ENV['RACK_ENV'] = 'test'

class HelloWorldTest < Minitest::Test
  include Rack::Test::Methods

  def app
    App
  end

  def test_bookmarket
    get '/bookmarklet.js'
    assert last_response.ok?
  end

  def test_bookmarket_with_salt
    get '/bookmarklet.js?salt=telkramkoob'
    assert last_response.ok?
    assert last_response.body.include?('telkramkoob')
  end

  def test_it_says_hello_to_a_person
    get '/app'
    assert last_response.ok?
  end
end
