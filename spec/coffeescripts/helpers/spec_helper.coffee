window.RUNNING_TESTS = true

window.$sandbox = $('<div id="sandbox" />')
window.sandboxAdded = false

_ensureEnderObject = (obj) ->
  unless typeof obj is "object" and '$' of obj
    throw new Error("Object doesn't seem to be an Ender instance!")

window.specHelpers =
  fireEvent: (element, type, isNative, fn) ->
    # I'm just going off the bean source here
    # XXX: This doesn't work with mousemove....
    #      Look into the jQuery simulate plugin:
    #      <http://code.google.com/p/jqueryjs/source/browse/trunk/plugins/simulate/jquery.simulate.js?r=6163>
    evt = document.createEvent(if isNative then 'HTMLEvents' else 'UIEvents')
    evt[if isNative then 'initEvent' else 'initUIEvent'](type, true, true, window, 1)
    fn?(evt)
    element.dispatchEvent(evt)
    evt
  fireNativeEvent: (element, type, fn) ->
    @fireEvent(element, type, true, fn)
  fireCustomEvent: (element, type, fn) ->
    @fireEvent(element, type, false, fn)

beforeEach ->
  @addMatchers(
    toContainObject: (expected) ->
      # $.v.every can't cope with objects, only arrays
      result = true
      result &= @env.equals_(@actual[key], expected[key]) for key, val of expected
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

    # Override Jasmine built-in matcher so that if passed no arguments, we
    # simply check if the receiver is a real value
    toBe: ->
      if arguments.length
        jasmine.Matchers.prototype.toBe.apply(this, arguments)
      else
        @actual?

    toEqualCell: (cell) ->
      unless @actual
        throw new Error("Actual object is undefined.")
      unless @actual instanceof SpriteEditor.Cell
        throw new Error("Actual object isn't a Cell!")
      unless cell
        throw new Error("Expected object is undefined.")
      unless cell instanceof SpriteEditor.Cell
        throw new Error("Expected object isn't a Cell!")

      result = (
        (@actual.loc.eq(cell.loc) or (!@actual.loc and !cell.loc)) and
        (@actual.color.eq(cell.color) or (!@actual.color and !cell.color))
      )
      @message = -> [
        "Expected #{@actual.inspect()} to be equal to #{cell.inspect()}",
        "Expected #{@actual.inspect()} to not be equal to given color"
      ]
      result

    toEqualColor: (color) ->
      unless @actual
        throw new Error("Actual object is undefined.")
      unless @actual instanceof SpriteEditor.Color
        throw new Error("Actual object isn't a Color!")
      unless color
        throw new Error("Expected object is undefined.")
      unless color instanceof SpriteEditor.Color
        throw new Error("Expected object isn't a Color!")

      result = @actual.eq(color)
      @message = -> [
        "Expected #{@actual.inspect()} to be equal to #{color.inspect()}",
        "Expected #{@actual.inspect()} to not be equal to given color"
      ]
      result

    toBeElementOf: (nodeName) ->
      _ensureEnderObject(@actual)
      @actual[0].nodeName.toLowerCase() == nodeName.toLowerCase()

    toHaveClass: (cssClass) ->
      _ensureEnderObject(@actual)
      @actual.hasClass(cssClass)

    toHaveAttr: ->
      _ensureEnderObject(@actual)
      if arguments.length == 2
        props = {}
        props[arguments[0]] = arguments[1]
      else
        props = arguments[0]
      # $.v.every can't cope with objects, only arrays
      actual = $.v.reduce($.v.keys(props), ((h, k) => h[k] = @actual.attr(k); h), {})
      result = @env.equals_(actual, props)
      @message = -> [
        "Expected element to have attributes #{jasmine.pp(props)}, but its attributes were #{jasmine.pp(actual)}",
        "Expected element to not have attributes #{jasmine.pp(actual)}"
      ]
      result

    toHaveCss: ->
      _ensureEnderObject(@actual)
      if arguments.length == 2
        props = {}
        props[arguments[0]] = arguments[1]
      else
        props = arguments[0]
      # $.v.every can't cope with objects, only arrays
      actual = $.v.reduce($.v.keys(props), ((h, k) => h[k] = @actual.css(k); h), {})
      result = @env.equals_(actual, props)
      @message = -> [
        "Expected element to have css #{jasmine.pp(props)}, but its css was #{jasmine.pp(actual)}",
        "Expected element to not have css #{jasmine.pp(actual)}"
      ]
      result

    toHaveContent: (html) ->
      _ensureEnderObject(@actual)
      @actual.html() == html

    toBeElement: (other) ->
      _ensureEnderObject(@actual)
      _ensureEnderObject(other)
      @actual[0] == other[0]

    toContainElement: (selector, options={}) ->
      _ensureEnderObject(@actual)
      if typeof selector is "object" and '$' of selector
        # `selector` is an Ender object
        result = $.isAncestor(@actual[0], selector[0])
        if options.content
          result &&= (selector.html() == options.content)
      else
        # `selector` is a string
        $elem = @actual.find(selector)
        result = !!$elem.length
        if options.content
          result &&= ($elem.html() == options.content)
      result
  )

  # Add a sandbox element to the body, or clear it
  if window.sandboxAdded
    window.$sandbox.empty()
  else
    window.$sandbox.appendTo(document.body)
    window.sandboxAdded = true