beforeEach ->
  @addMatchers(
    toContainObject: (expected) ->
      success = true
      for key, val of expected
        success &= @env.equals_(@actual[key], val)
      success

    toBeAnInstanceOf: (cons) ->
      # Various classes in the Webkit DOM are seemingly instances of *Constructor.
      # For instance, HTMLDocument appears to be an instance of HTMLDocumentConstructor.
      unless typeof cons is "function" or cons.toString().match(/Constructor\b/)
        throw "Given constructor is not a Function, it is: #{cons}"
      if @actual instanceof cons
        return true
      else
        expected_match = cons.toString().match(/^\[object (\w+)\]$/)
        actual_match   = @actual.constructor.toString().match(/^\[object (\w+)\]$/)
        if expected_match and actual_match
          expected_class = expected_match[1]
          actual_class = actual_match[1]
          @message = -> "Expected object to be an instance of #{expected_class}, but it was an instance of #{actual_class}"
        else if expected_match
          @message = -> "Expected object to be an instance of #{expected_class}, but it was: #{actual}"
        return false

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

  # Add container element we can dump elements into
  $('<div id="sandbox"/>').appendTo(document.body)

afterEach ->
  # Remove the container element we added earlier
  $('#sandbox').remove()