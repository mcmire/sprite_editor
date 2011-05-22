require 'sinatra'
require 'base64'
require 'pp'

get "/?" do
  erb :"index"
end

post "/?" do
  body = Base64.decode64(params[:data])
  [200, {
    "Content-Type" => "image/png",
    "Content-Length" => Rack::Utils.bytesize(body),
    "Content-Disposition" => "attachment; filename=image.png"
  }, body]
end

get "/keyboard_test/?" do
  erb :"keyboard_test"
end