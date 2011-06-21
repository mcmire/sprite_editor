# Sass
guard 'shell' do
  watch( %r{app/stylesheets/.*\.scss} ) do |m|
    `compass compile`
  end
end

# CoffeeScript
guard 'coffeescript', :input => 'app/javascripts',    :output => 'public/javascripts'
guard 'coffeescript', :input => 'spec/coffeescripts', :output => 'spec/javascripts'

# Jasmine tests
# TODO: This is currently slow... I'm wondering if bundler is being loaded every time...
guard 'jasmine-headless-webkit' do
  watch( %r{^app/javascripts/(.+)\.coffee$} ) {|m| "spec/coffeescripts/%s_spec.coffee" % m[1] }
  watch( %r{^spec/coffeescripts/(.+)_spec.coffee$} )
end