((window, document, $, undefined_) ->
  $.ender 
    extend: ->
      args = Array::slice.call(arguments)
      deep = false
      deep = args.shift()  if typeof args[0] == "boolean"
      target = args.shift()
      objects = args
      self = this
      $.v.each objects, (obj) ->
        for prop of obj
          continue  unless obj.hasOwnProperty(prop)
          if typeof target[prop] == "function"
            ((_super, _new) ->
              target[prop] = ->
                tmp = @_super
                @_super = _super
                rv = _new.apply(this, arguments)
                @_super = tmp
                rv
            ) target[prop], obj[prop]
          else if deep and $.v.is.obj(obj[prop])
            target[prop] = self.extend(deep, {}, obj[prop])
          else
            target[prop] = obj[prop]
      
      target
    
    clone: (obj) ->
      $.extend {}, obj
    
    proxy: (obj, fn) ->
      obj[fn].apply obj, arguments
    
    ns: (chain) ->
      context = window
      chain = chain.split(".")  if typeof chain == "string"
      $.v.each chain, (id) ->
        context[id] = {}  if typeof context[id] == "undefined"
        context = context[id]
      
      context
    
    export: (chain, obj) ->
      chain = chain.split(".")  if typeof chain == "string"
      tail = chain.pop()
      chain = @ns(chain)
      chain[tail] = obj
    
    tap: (obj, fn) ->
      fn obj
      obj
  
  $.ender 
    center: ->
      vp = $.viewport()
      self = $([ this[0] ])
      top = (vp.height / 2) - (self.height() / 2)
      left = (vp.width / 2) - (self.width() / 2)
      self.css("top", top + "px").css "left", left + "px"
      this
    
    absoluteOffset: ->
      return null  if @length == 0
      node = this[0]
      top = 0
      left = 0
      loop
        top += node.offsetTop
        left += node.offsetLeft
        break unless node = node.offsetParent
      top: top
      left: left
    
    position: ->
      po = @parent().offset()
      o = @offset()
      top: o.top - po.top
      left: o.left - po.left
    
    parent: ->
      $ this[0].parentNode
    
    computedStyle: (prop) ->
      elem = this[0]
      
      if typeof elem.currentStyle != "undefined"
        computedStyle = elem.currentStyle
      else
        computedStyle = document.defaultView.getComputedStyle(elem, null)
      (if prop then computedStyle[prop] else computedStyle)
  , true
  Math.randomFloat = (min, max) ->
    Math.random() * (max - min) + min
  
  Math.randomInt = (min, max) ->
    Math.floor(Math.random() * (max - min + 1)) + min
  
  String.format = ->
    args = Array::slice.call(arguments)
    str = args.shift()
    i = 0
    
    while i < args.length
      regexp = new RegExp("\\{" + i + "\\}", "gi")
      str = str.replace(regexp, args[i])
      i++
    str
  
  String.capitalize = (str) ->
    return ""  unless str
    str[0].toUpperCase() + str.slice(1)
) window, window.document, window.ender
