guard 'shell' do
  watch(/^sass\/(.*)\.scss/) {|m| `compass compile` }
end

guard 'coffeescript', :input => 'coffeescripts', :output => 'javascripts'