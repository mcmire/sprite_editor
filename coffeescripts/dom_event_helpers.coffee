(($, undefined_) ->
  mixin = 
    _bindEvents: (elem, events) ->
      self = this
      namespacedEvents = {}
      $.v.each events, (name, fn) ->
        namespacedEvents[name + "." + self.eventNamespace] = fn
      
      $(elem).bind namespacedEvents
    
    _unbindEvents: ->
      self = this
      args = Array::slice.call(arguments)
      elem = $(args.shift())
      namespacedEventNames = $.v.map(args, (name) ->
        name + "." + self.eventNamespace
      )
      $(elem).unbind namespacedEventNames.join(" ")
  
  DOMEventHelpers = mixin: (obj, eventNamespace) ->
    $.extend obj, mixin
    obj.eventNamespace = eventNamespace
  
  $.export "SpriteEditor.DOMEventHelpers", DOMEventHelpers
) window.ender
