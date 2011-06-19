require 'open3'

module Guard
  module Jasmine
    class Runner

      EXECUTABLE = `which jasmine-node`.strip

      def initialize(guard)
        @guard = guard

        if EXECUTABLE.empty?
          UI.error "jasmine-node is not installed. You'll need to `npm install jasmine-node` to run Jasmine tests."
          exit 1
        end
      end

      def run(files, &block)
        return false if files.empty?
        UI.info("Running Jasmine specs: #{files.join(' ')}")
        _run_command(files)
      end

    private
      def info(message, options={})
        UI.info(message, options)
        ::Guard::Notifier.notify(message, options.merge(:image => nil))
      end

      def success(message, options={})
        UI.success(message, options)
        ::Guard::Notifier.notify(message, options.merge(:image => :success))
      end

      def error(message, options={})
        UI.error(message, options)
        ::Guard::Notifier.notify(message, options.merge(:image => :failed))
      end

      def _run_command(files)
        out, pid = Open3.capture2e(EXECUTABLE, "--coffee", *files)
        result = _parse_output(out)
        if result
          specs_count   = _pluralize(result[:assertions], "example", "examples")
          failed_count  = _pluralize(result[:failures], "failure", "failures")
          result[:success] ? success(result[:msg]) : error(result[:msg])
        else
          error("Error running Jasmine specs!")
        end

        status = pid >> 8
        puts(out)# unless status == 0  # ensure that backtraces show up in the guard output
      end

      def _pluralize(count, singular, plural)
        count.to_i == 1 ? "#{count} #{singular}" : "#{count} #{plural}"
      end

      def _parse_output(out)
        match1 = out.match(/Finished in (\d.\d+) seconds/)
        match2 = out.match(/(\d+) tests?, (\d+) assertions?, (\d+) failures?/)
        if match1 && match2
          duration = match1[1]
          msg = match2[0]
          tests, assertions, failures = match.captures
          {
            :msg => msg,
            :tests => tests,
            :assertions => assertions,
            :failures => failures,
            :success => (failures == "0"),
            :duration => duration
          }
        end
      end

    end
  end
end