require 'colored'

module Guard
  module Jasmine
    module UI
      class << self
        def info(message, options={})
          puts message.yellow
        end

        def success(message, options={})
          puts message.green
        end

        def error(message, options={})
          warn message.red
        end
      end
    end
  end
end