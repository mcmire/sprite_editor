window.specHelpers =
  fireEvent: (element, type, fn) ->
    evt = document.createEvent("HTMLEvents")
    evt.initEvent(type, true, true)
    fn?(evt)
    element.dispatchEvent(evt)

beforeEach ->
  @addMatchers(
    toContainObject: (expected) ->
      result = true
      for key, val of expected
        result &= @env.equals_(@actual[key], val)
      result

    toBeAnInstanceOf: (cons) ->
      # Various classes in the Webkit DOM are seemingly instances of *Constructor.
      # For instance, HTMLDocument appears to be an instance of HTMLDocumentConstructor.
      unless typeof cons is "function" or cons.toString().match(/Constructor\b/)
        throw "Given constructor is not a Function, it is: #{cons}"
      failure_message = negative_failure_message = null
      result = null
      if @actual instanceof cons
        result = true
      else
        expected_match = cons.toString().match(/^\[object (\w+)\]$/)
        actual_match   = @actual.constructor.toString().match(/^\[object (\w+)\]$/)
        if expected_match and actual_match
          expected_class = expected_match[1]
          actual_class = actual_match[1]
          failure_message = "Expected object to be an instance of #{expected_class}, but it was an instance of #{actual_class}"
        else if expected_match
          failure_message = "Expected object to be an instance of #{expected_class}, but it was: #{actual}"
        result = false
      @message = -> [failure_message, negative_failure_message]
      return result

    toThrowAnything: ->
      if typeof @actual isnt "function"
        throw new Error("Actual is not a function")
      failure_message = negative_failure_message = null
      result = null
      try
        @actual()
        result = false
      catch e
        negative_failure_message = "Expected function not to throw an exception, but it threw #{e.message || e}"
        result = true
      @message = -> [failure_message, negative_failure_message]
      return result

    toHaveProperty: (prop) ->
      @actual.hasOwnProperty(prop)

    toBeTypeOf: (type) ->
      typeof @actual == type

    toEqualColor: (color) ->
      unless @actual instanceof SpriteEditor.Color
        throw new Error("Actual object isn't a Color!")
      unless color instanceof SpriteEditor.Color
        throw new Error("Expected object isn't a Color!")

      result = @actual.eq(color)
      @message = -> [
        "Expected #{@actual.inspect()} to be equal to #{color.inspect()}, but it wasn't",
        "Expected #{@actual.inspect()} to not be equal to given color, but it was"
      ]
      result

  )

  # Add container element we can dump elements into
  $('<div id="sandbox"/>').appendTo(document.body)

afterEach ->
  # Remove the container element we added earlier
  $('#sandbox').remove()