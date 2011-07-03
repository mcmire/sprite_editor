# Override so that when a *_spec.rb file is generated from a *_spec.coffee
# file, it does not cause the spec to be run twice
#
def Guard.run_on_change_for_all_guards(files)
  guards.each do |guard|
    paths = Watcher.match_files(guard, files)
    supervised_task(guard, :run_on_change, paths) unless paths.empty?
  end
end

# Sass
guard 'shell' do
  watch( %r{app/stylesheets/.*\.scss} ) {|m| `compass compile` }
end

# CoffeeScript
guard 'coffeescript', :input => 'app/javascripts',    :output => 'public/javascripts'
guard 'coffeescript', :input => 'spec/coffeescripts', :output => 'spec/javascripts'

# Jasmine tests
guard 'jasmine-headless-webkit' do
  watch( %r{^public/javascripts/(.+)\.js$} ) {|m|
    path = "spec/javascripts/%s_spec.js" % m[1]
    File.exists?(path) ? path : nil
  }
  watch( %r{^spec/javascripts/(.+)_spec.js$} )
end
