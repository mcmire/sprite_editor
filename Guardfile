guard 'shell' do
  watch(/^app\/stylesheets\/(.*)\.scss/) {|m| `compass compile` }
end

guard 'coffeescript', :input => 'app/javascripts', :output => 'public/javascripts'