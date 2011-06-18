$.export "SpriteEditor.DOMEventHelpers", (SpriteEditor) ->

  mixin =
    _bindEvents: (elem, events) ->
      namespacedEvents = {}
      for name, fn of events
        namespacedEvents[name + "." + @eventNamespace] = fn
      $(elem).bind(namespacedEvents)

    _unbindEvents: (elem, args...) ->
      namespacedEventNames = (name + "." + @eventNamespace for name in args)
      $(elem).unbind(namespacedEventNames.join(" "))

  DOMEventHelpers =
    mixin: (obj, eventNamespace) ->
      $.extend(obj, mixin)
      obj.eventNamespace = eventNamespace

  return DOMEventHelpers