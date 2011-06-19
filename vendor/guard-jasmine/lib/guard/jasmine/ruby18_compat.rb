
# Backport methods added to Open3 in Ruby 1.9 (1.9.2-p180, to be more exact)
#
module Open3
  class << self
    unless method_defined?(:capture2e)
      def capture2e(*cmd, &block)
        if Hash === cmd.last
          opts = cmd.pop.dup
        else
          opts = {}
        end

        stdin_data = opts.delete(:stdin_data) || ''
        binmode = opts.delete(:binmode)

        args = cmd + [opts]
        popen2e(*args) {|i, oe, t|
          if binmode
            i.binmode
            oe.binmode
          end
          outerr_reader = Thread.new { oe.read }
          i.write stdin_data
          i.close
          [outerr_reader.value, t.value]
        }
      end
    end

    unless method_defined?(:popen2e)
      def popen2e(*cmd, &block)
        if Hash === cmd.last
          opts = cmd.pop.dup
        else
          opts = {}
        end

        in_r, in_w = IO.pipe
        opts[:in] = in_r
        in_w.sync = true

        out_r, out_w = IO.pipe
        opts[[:out, :err]] = out_w

        popen_run(cmd, opts, [in_r, out_w], [in_w, out_r], &block)
      end
    end

  private
    unless method_defined?(:popen_run)
      def popen_run(cmd, opts, child_io, parent_io) # :nodoc:
        args = cmd + [opts]
        pid = spawn(*args)
        wait_thr = Process.detach(pid)
        child_io.each {|io| io.close }
        result = parent_io + [wait_thr]
        if defined? yield
          begin
            return yield(*result)
          ensure
            parent_io.each{|io| io.close unless io.closed?}
            wait_thr.join
          end
        end
        result
      end
    end
  end
end