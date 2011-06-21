beforeEach ->
  @addMatchers(
    toContainObject: (expected) ->
      success = true
      for key, val of expected
        success &= @env.equals_(@actual[key], val)
      success
    toBeAnInstanceOf: (klass) ->
      @actual instanceof klass
    toThrowAnything: ->
      if typeof @actual isnt "function"
        throw new Error("Actual is not a function")
      try
        @actual()
        if result = !@isNot
          @message = -> "Expected function to throw an exception, but it didn't"
      catch e
        if result = @isNot
          @message = -> "Expected function not to throw an exception, but it threw #{e.message || e}"
      return result
  )