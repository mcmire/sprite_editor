# Sass
guard 'shell' do
  watch( %r{app/stylesheets/.*\.scss} ) {|m| `compass compile` }
end

# CoffeeScript
guard 'coffeescript', :input => 'app/javascripts',    :output => 'public/javascripts'
guard 'coffeescript', :input => 'spec/coffeescripts', :output => 'spec/javascripts'

# Jasmine tests
guard 'jasmine-headless-webkit' do
  watch( %r{^app/javascripts/(.+)\.coffee$} ) {|m|
    path = "spec/coffeescripts/%s_spec.coffee" % m[1]
    File.exists?(path) ? path : nil
  }
  watch( %r{^spec/coffeescripts/(.+)_spec.coffee$} )
end