# Add class methods to the global ender object
$.ender {

  # $.extend(deep, target, objects...)
  # $.extend(target, objects...)
  #
  # Takes the given object and adds the given properties to it.
  #
  # Properties that already exist in the object are overridden. Functions are
  # handled specially, however. To wit, if two properties share the same name
  # and are functions (let's call them function A and B), instead of function A
  # being overridden with function B, you get a new function C which wraps
  # function B. Function C is exactly the same as B, except that within C
  # you have a reference to B through a `_super` property.
  #
  extend: ->
    args = Array::slice.call(arguments)
    deep = false
    deep = args.shift() if typeof args[0] == "boolean"
    target = args.shift()
    objects = args

    for obj in objects
      for own prop of obj
        if typeof target[prop] == "function"
          ((_super, _new) ->
            target[prop] = ->
              tmp = @_super
              @_super = _super
              rv = _new.apply(this, arguments)
              @_super = tmp
              rv
          )(target[prop], obj[prop])
        else if deep and $.v.is.obj(obj[prop])
          target[prop] = @extend(deep, {}, obj[prop])
        else
          target[prop] = obj[prop]

    return target

  # Makes a shallow clone of the given object. That is, any properties which
  # are objects will be copied by reference, not value, so if you change them
  # you'll be changing the original objects.
  #
  clone: (obj) -> $.extend({}, obj)

  # Wraps the given function in another function which will call the original
  # function in the given context. Useful if you want to use a method of
  # an object as an event listener, while keeping the 'this' reference inside
  # the function as the object.
  #
  proxy: (obj, fn) -> obj[fn].apply(obj, arguments)

  # Given a string which represents a chain of objects (separated by "."),
  # ensures that all objects in the chain exist (by creating them if they don't),
  # and then returns the final object. For instance, given "Foo.Bar.Baz",
  # `Foo` would be created if it doesn't exist, then `Foo.Bar`, then
  # `Foo.Bar.Baz`; and then Foo.Bar.Baz would be returned.
  #
  ns: (chainStrs) ->
    context = window
    chainStrs = chainStrs.split(".") if typeof chainStrs == "string"
    for idStr in chainStrs
      context[idStr] ?= {}
      context = context[idStr]
    context

  # Given a string which represents a chain of objects (separated by "."),
  # returns the objects in the chain (assuming they exist).
  # For instance, given "Foo.Bar.Baz", returns [Foo, Foo.Bar, Foo.Bar.Baz].
  #
  chain: (chainStrs) ->
    obj = window
    chainStrs = chainStrs.split(".") if typeof chainStrs == "string"
    chain = []
    for idStr in chainStrs
      obj = obj[idStr]
      chain.push(obj)
    chain

  # Given a string which represents a chain of objects (separated by "."),
  # ensures that all objects in the chain exist (by creating them if they don't),
  # then adds the given object (which may also be a function that returns an
  # object) to the end of the chain.
  #
  export: (chainStrs, newObj) ->
    chainStrs = chainStrs.split(".") if typeof chainStrs is "string"
    newIdStr = chainStrs.pop()
    tail = @ns(chainStrs)
    chain = @chain(chainStrs)
    newObj = newObj.apply(newObj, chain) if typeof newObj is "function"
    tail[newIdStr] = newObj

  # The Kestrel combinator. Lets you group a block of code that's intended
  # to not only operate on a value but return it at the end, too.
  #
  tap: (obj, fn) ->
    fn(obj)
    obj
}

#-------------------------------------------------------------------------------

# Add methods to each ender element
$.ender {

  center: ->
    vp = $.viewport()
    self = $([ this[0] ])
    top = (vp.height / 2) - (@height() / 2)
    left = (vp.width / 2) - (@width() / 2)
    @css("top", top + "px").css("left", left + "px")
    return this

  absoluteOffset: ->
    return null if @length == 0

    node = this[0]
    top = 0
    left = 0

    loop
      top += node.offsetTop
      left += node.offsetLeft
      break unless node = node.offsetParent

    return {top: top, left: left}

  position: ->
    po = @parent().offset()
    o = @offset()
    top: o.top - po.top
    left: o.left - po.left

  parent: ->
    $(this[0].parentNode)

  # Copied from <http://blog.stchur.com/2006/06/21/css-computed-style/>
  computedStyle: (prop) ->
    elem = this[0]

    if typeof elem.currentStyle != "undefined"
      computedStyle = elem.currentStyle
    else
      computedStyle = document.defaultView.getComputedStyle(elem, null)
    (if prop then computedStyle[prop] else computedStyle)

}, true

#-------------------------------------------------------------------------------

# Returns a random number between min (inclusive) and max (exclusive).
# Copied from the MDC wiki
#
Math.randomFloat = (min, max) ->
  Math.random() * (max - min) + min

# Returns a random integer between min (inclusive) and max (exclusive?).
# Using Math.round() will give you a non-uniform distribution!
# Copied from the MDC wiki
#
Math.randomInt = (min, max) ->
  Math.floor(Math.random() * (max - min + 1)) + min

# <http://stackoverflow.com/questions/610406/javascript-printf-string-format>
#
String.format = (str, args...) ->
  for i in [0..args.length]
    regexp = new RegExp("\\{"+i+"\\}", "gi")
    str = str.replace(regexp, args[i])
  return str

String.capitalize = (str) ->
  return "" unless str
  str[0].toUpperCase() + str.slice(1)