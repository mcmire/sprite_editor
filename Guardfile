require 'guard/jasmine'  # for some reason this is not happening automatically

# Sass
guard 'shell' do
  watch( %r{app/stylesheets/.*\.scss} ) do |m|
    `compass compile`
  end
end

# CoffeeScript
guard 'coffeescript', :input => 'app/javascripts', :output => 'public/javascripts'

# Jasmine tests
guard 'jasmine', :source_dir => 'app/javascripts'