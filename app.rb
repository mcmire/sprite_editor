require 'sinatra'
require 'base64'
require 'pp'

set :views, "app/views"

get "/?" do
  erb :index
end

post "/?" do
  status 200
  headers \
    "Content-Type" => "image/png",
    "Content-Length" => Rack::Utils.bytesize(params[:data]),
    "Content-Disposition" => "attachment; filename=image.png"
  body Base64.decode64(params[:data])
end

get "/keyboard_test/?" do
  erb :keyboard_test
end