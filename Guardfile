# Sass
guard 'shell' do
  watch( %r{app/stylesheets/.*\.scss} ) do |m|
    `compass compile`
  end
end

# CoffeeScript
guard 'coffeescript', :input => 'app/javascripts', :output => 'public/javascripts'