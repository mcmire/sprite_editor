raise "Ruby 1.9 is required!" unless RUBY_VERSION =~ /^1\.9/

source :rubygems

gem 'sinatra', '1.1.4'
gem 'compass', '0.11.beta.2'

#group :development do
  #gem 'json'
  gem 'rb-fsevent'
  # Use my fork of guard which prevents during the guard run from being completely swallowed
  gem 'guard', :git => "http://github.com/mcmire/guard", :branch => "dont_swallow_error_on_running_task"
  gem 'guard-shell'
  gem 'guard-coffeescript'
  gem 'growl'
  #gem 'popen4'
  gem 'colored'
  gem 'guard-jasmine', :path => "vendor/guard-jasmine"#, :require => "guard/jasmine"
#end