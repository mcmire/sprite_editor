# Pretty printing large data structures that contain multiple levels of
# other large data structures is impossible to read. Override jasmine.pp()
# to call object.inspect() if that exists.
#
proto = jasmine.PrettyPrinter.prototype
proto.oldFormat_ = proto.format
proto.format = (value) ->
  if value? and typeof value.inspect is "function"
    @append(value.inspect())
  else
    @oldFormat_(value)
