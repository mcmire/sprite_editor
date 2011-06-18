require 'rubygems'
require 'bundler'

Bundler.require

require File.expand_path("../app", __FILE__)

use Rack::Static, :urls => %w(/stylesheets /javascripts /images), :root => "public"
run Sinatra::Application
