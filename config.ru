require File.expand_path("../app", __FILE__)

use Rack::Static, :urls => %w(/stylesheets /javascripts /images)
run Sinatra::Application