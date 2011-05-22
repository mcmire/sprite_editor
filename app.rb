require 'sinatra'

get "/?" do
  erb :"index"
end

get "/keyboard_test/?" do
  erb :"keyboard_test"
end