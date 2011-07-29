###
jasmine.Env.prototype.it = (description, func) ->
  spec = new jasmine.Spec(this, @currentSuite, description)
  @currentSuite.add(spec)
  @currentSpec = spec

  if func
    spec.runs(func)
  else
    # PATCH
    spec.runs(-> throw new Error("pending"))

  return spec
###