require 'guard'
require 'guard/guard'

#require 'guard/jasmine/ruby18_compat'
require 'pp'  # for debugging purposes

module Guard
  module Jasmine
    autoload :Guard,  'guard/jasmine/guard'
    autoload :Runner, 'guard/jasmine/runner'
    autoload :UI,     'guard/jasmine/ui'

    def self.new(*args)
      ::Guard::Jasmine::Guard.new(*args)
    end
  end
end