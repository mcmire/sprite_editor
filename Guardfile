guard 'shell' do
  watch(/^sass\/(.*)\.scss/) {|m| `compass compile` }
end

guard 'livereload', :api_version => '1.6' do
  watch(/.+\.(css|js|html|png|jpg|gif)$/)
end

guard 'coffeescript', :input => 'coffeescripts', :output => 'javascripts'