beforeEach ->
  @addMatchers(
    toContainObject: (expected) ->
      success = true
      for key, val of expected
        success &= @env.equals_(@actual[key], val)
      success
  )