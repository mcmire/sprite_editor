module Guard
  module Jasmine
    class Guard < ::Guard::Guard
      attr_reader :source_watcher, :spec_watcher

      def initialize(watchers = [], options = {})
        super

        @options[:source_dir] ||= "public/javascripts"
        @options[:spec_dir]    ||= "spec/javascripts"

        @source_watcher = ::Guard::Watcher.new( %r{^#{@options[:source_dir]}/.+\.(?:coffee|js)$} )
        @spec_watcher = ::Guard::Watcher.new( %r{^#{@options[:spec_dir]}/.+_spec\.(?:coffee|js)$} )
        @watchers << @source_watcher << @spec_watcher

        @runner = Runner.new(self)
      end

      def run_all
        @runner.run Dir["#{@options[:spec_dir]}/**/*_spec.{coffee,js}"]
      end

      def run_on_change(paths)
        spec_files = [
          _find_specs_for_source_files(_match_source_files(paths)),
          _match_spec_files(paths)
        ].flatten.compact
        @runner.run(spec_files.flatten)
      end

    private
      def _match_source_files(paths)
        paths.inject([]) do |source_matches, path|
          if match = @source_watcher.match_file?(path)
            source_matches << match[0]
          end
          source_matches
        end
      end

      def _match_spec_files(paths)
        paths.inject([]) do |spec_matches, path|
          if match = @spec_watcher.match_file?(path)
            spec_matches << match[0]
          end
          spec_matches
        end
      end

      def _find_specs_for_source_files(matches)
        matches.map {|match|
          Dir[ match[0].sub(@options[:source_dir], @options[:spec_dir]).sub(%r{/(.+).(?:coffee|js)$}, '\\1_spec.{coffee,js}') ]
        }
      end
    end
  end
end