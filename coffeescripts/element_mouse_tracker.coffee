$.export "SpriteEditor.ElementMouseTracker", do ->

  ElementMouseTracker = {}
  SpriteEditor.DOMEventHelpers.mixin(ElementMouseTracker, "SpriteEditor_ElementMouseTracker")

    instances: []
    activeInstance:
      mouseWithin: null
      mouseHeldWithin: null

    init: ->
      self = this

      # We bind these events to the document rather than to the element to
      # make it possible to do special behavior when the user moves the mouse
      # outside of the element in question. For instance, we definitely want
      # to trigger the mouseup event outside the element. As another example,
      # the ColorPickerBox widget has logic that keeps the hue/saturation
      # selector indicator inside the canvas for hue/saturation even if the
      # user moves the mouse outside of the canvas.
      #
      @_bindEvents document,
        mouseup: (event) ->
          inst = self.activeInstance.mouseHeldWithin
          inst.triggerHandler "mousedragstop" if inst && inst.isDragging
          for inst in self.activeInstances()
            inst.triggerHandler("mouseup", event)
          #event.stopPropagation();
          event.preventDefault()
        mousemove: (event) ->
          self.pos = {x: event.pageX, y: event.pageY}
          for inst in self.activeInstances()
            inst.triggerHandler("mousemove", event)
          event.preventDefault()

    destroy: ->
      @_unbindEvents(document, "mouseup", "mousemove")
      @debugDiv().hide()

    # Starts tracking the mouse in the context of an element.
    #
    # We first wrap the given element in an instance of the
    # ElementMouseTracker.instance class, which takes care of binding
    # mouse-related event handlers to the element. Since multiple elements may
    # be bound at the same time, we then store this instance in an array so
    # that we have access to it later.
    #
    # You may specify an option hash to customize the events which are bound
    # on the element. The list of possible events not only includes native
    # events and the extra cross-browser-compatible events that Bean provides,
    # but also special events which are related to dragging. All of these
    # handlers are executed whenever they occur on the element being tracked,
    # except for mouseup, which is executed on the document level, as we
    # still want that to occur even if the user's mouse moves outside of the
    # element. Here is the full list of events:
    #
    #   mouseup
    #   mousedown
    #   mouseover
    #   mouseout
    #   mouseenter
    #   mouseleave
    #   mousemove
    #   mousedragstart
    #     Invoked the first time the mouse is being dragged, starting from the
    #     element
    #   mousedrag
    #     Invoked repeatedly while the mouse is being dragged within the element
    #   mousedragstop
    #     Invoked if the mouse was being dragged and is now released, or when it
    #     leaves the element
    #   mouseglide
    #     Invoved repeatedly while the mouse is being moved over the element but
    #     not being dragged
    #
    # The custom dragging events are derived from either mousemove or mouseup,
    # so you still have access to an event object, which will be passed to
    # your handler function as with the other events.
    #
    # Returns the instance of ElementMouseTracker.instance. You'll want to
    # store this somewhere so you can destroy it later.
    #
    add: ($element, options) ->
      @init() if @instances.length == 0

      instance = new ElementMouseTracker.instance($element, options)
      @instances.push(instance)

      instance

    # Given an instance of ElementMouseTracker.instance previously obtained from
    # add(), does some cleanup to remove the event handlers from the associated
    # element and then remove the instance from the instances array.
    #
    remove: (instance) ->
      instance.destroy()
      index = $.v.indexOf(@instances, instance)
      @instances.splice(index, 1)  # remove at index

      if @activeInstance.mouseWithin == instance
        delete @activeInstance.mouseWithin
      if @activeInstance.mouseHeldWithin == instance
        delete @activeInstance.mouseHeldWithin

      @destroy() if @instances.length == 0

    debugDiv: ->
      @$debugDiv ||= $('<div />')
        .html("&nbsp;")
        .css(
          position: "absolute"
          top: 0
          left: 0
          padding: "2px"
          "background-color": "lightyellow"
          width: "200px"
          height: "50px"
        )
      .appendTo(document.body)

    activeInstances: ->
      instances = [ @activeInstance.mouseHeldWithin, @activeInstance.mouseWithin ]
      $.v(instances).chain().compact().uniq().value()

  #-----------------------------------------------------------------------------

  class ElementMouseTracker.instance
    SpriteEditor.DOMEventHelpers.mixin(this.prototype, "SpriteEditor_ElementMouseTracker")

    constructor: ($element, options) ->
      @$element = $element
      @options = {}
      @customEvents = {}
      for keys, val of options
        for key in keys.split(" ")
          if /^mouse/.test(key)
            @customEvents[key] = val
          else
            @options[key] = val
      # default options
      @options.draggingDistance ?= 1

      @pos = {
        abs: {x: null, y: null},
        rel: {x: null, y: null}
      }
      @isDown = false
      @downAt = {
        abs: {x: null, y: null},
        rel: {x: null, y: null}
      }
      @isDragging = false

      @_addEvents()

      # Cache some values for later use
      @elementOffset = @$element.absoluteOffset()
      computedStyle = @$element.computedStyle()
      @elementSize =
        width: parseInt(computedStyle["width"], 10)
        height: parseInt(computedStyle["height"], 10)

    destroy: ->
      @_removeEvents()

    triggerHandler: (eventName, event) ->
      if /(up|stop|leave)$/.test(eventName)
        # Invoke the callback which was given in the options
        @customEvents[eventName]?.call(this, event)
        # Invoke the callback which is a method on this instance
        self[eventName]?.call(this, event)
      else
        # Invoke the callback which is a method on this instance
        self[eventName]?.call(this, event)
        # Invoke the callback which was given in the options
        @customEvents[eventName]?.call(this, event)

    mousemove: (event) ->
      @_setMousePosition()

      # If dragging isn't set yet, set it until the mouse is lifted off
      if @isDown
        if @isDragging
          dist = @_distance(@downAt.abs, @pos.abs)
          @isDragging = (dist >= @options.draggingDistance)
          @triggerHandler("mousedragstart", event)
      else
        @isDragging = false
        @triggerHandler("mouseglide", event)

      @triggerHandler("mousedrag", event) if @isDragging

      if @options.debug
        ElementMouseTracker.debugDiv().html(
          String.format("abs: ({0}, {1})<br/>rel: ({2}, {3})", @pos.abs.x, @pos.abs.y, @pos.rel.x, @pos.rel.y)
        )

    mousedragstop: (event) ->
      @isDragging = false

    mouseup: (event) ->
      @isDown = false
      delete ElementMouseTracker.activeInstance.mouseHeldWithin

      ElementMouseTracker.debugDiv().hide() if @options.debug

    _setMousePosition: ->
      @pos =
        abs: ElementMouseTracker.pos
        rel: { x: event.pageX - @elementOffset.left, y: event.pageY - @elementOffset.top }
      # Correct the position if it's outside the bounds of the element
      if @pos.rel.x < 0
        @pos.rel.x = 0
      else if @pos.rel.x > @elementSize.width
        @pos.rel.x = @elementSize.width
      if @pos.rel.y < 0
        @pos.rel.y = 0
      else if @pos.rel.y > @elementSize.height
        @pos.rel.y = @elementSize.height

    _addEvents: ->
      self = this
      @_bindEvents, @$element,
        mouseover: (event) ->
          self.triggerHandler("mouseover", event)

        mouseout: (event) ->
          self.triggerHandler("mouseout", event)

        mouseenter: (event) ->
          ElementMouseTracker.activeInstance.mouseWithin = self
          self.triggerHandler("mouseenter", event)

        mouseleave: (event) ->
          delete ElementMouseTracker.activeInstance.mouseWithin
          self.triggerHandler("mouseleave", event)

        mousedown: (event) ->
          ElementMouseTracker.activeInstance.mouseHeldWithin = self
          self.isDown = true
          self._setMousePosition()
          self.downAt =
            abs: { x: event.pageX, y: event.pageY }
            rel: { x: event.pageX - self.elementOffset.left, y: event.pageY - self.elementOffset.top }

          ElementMouseTracker.debugDiv().show() if self.options.debug

          self.triggerHandler("mousedown", event)

          #event.stopPropagation();
          event.preventDefault()

        click: (event) ->
          self.triggerHandler("mouseclick", event)
          # Prevent things on the page from being selected
          event.preventDefault()

        contextmenu: (event) ->
          self.triggerHandler("contextmenu", event)
          # Prevent things on the page from being selected
          event.preventDefault()

    _removeEvents: ->
      @_unbindEvents @$element,
        "mouseover", "mouseout",
        "mouseenter", "mouseleave",
        "mousedown",
        "click", "contextmenu"

    _distance: (v1, v2) ->
      Math.floor Math.sqrt(Math.pow((v2.y - v1.y), 2) + Math.pow((v2.x - v1.x), 2))

  return ElementMouseTracker

#-------------------------------------------------------------------------------

$.ender({

  # == Call signatures:
  #
  #   $elem.mouseTracker()
  #   $elem.mouseTracker("destroy")
  #   $elem.mouseTracker("__instance__")
  #   $elem.mouseTracker("method", args...)
  #   $elem.mouseTracker("property")
  #
  mouseTracker: ->
    if @data("mouseTracker")
      mouseTracker = @data("mouseTracker")
    else if $.v.is.obj(arguments[0])
      mouseTracker = ElementMouseTracker.add(this, arguments[0])
      @data("mouseTracker", mouseTracker)

    if typeof arguments[0] == "string"
      if arguments[0] == "destroy"
        ElementMouseTracker.remove(mouseTracker)
        @data("mouseTracker", null)
      else if arguments[0] == "__instance__"
        # HACK!!
        return mouseTracker
      else
        value = mouseTracker[arguments[0]]
        if typeof value == "function"
          return value.apply(mouseTracker, Array::slice.call(arguments, 1))
        else if typeof value != "undefined"
          return value
        else
          throw "'#{arguments[0]}' is not a property of ElementMouseTracker!"

    return this

}, true)