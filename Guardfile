# Sass
guard 'shell' do
  watch( %r{app/stylesheets/.*\.scss} ) do |m|
    `compass compile`
  end
end

# CoffeeScript
guard 'coffeescript', :input => 'app/javascripts', :output => 'public/javascripts'

# Jasmine tests
guard 'jasmine-headless-webkit' do
  watch( %r{^app/javascripts/(.+)\.coffee$} ) {|m| "spec/javascripts/%s_spec.coffee" % m[1] }
  watch( %r{^spec/javascripts/(.+)_spec.coffee$} )
end

