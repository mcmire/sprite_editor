((window, document, $, undefined_) ->
  ElementMouseTracker = 
    instances: []
    activeInstance: 
      mouseWithin: null
      mouseHeldWithin: null
    
    init: ->
      self = this
      $(document).bind 
        "mouseup.ElementMouseTracker": (event) ->
          inst = self.activeInstance.mouseHeldWithin
          inst.triggerHandler "mousedragstop"  if inst and inst.isDragging
          $.v.each self.activeInstances(), (inst) ->
            inst.triggerHandler "mouseup", event
          
          event.preventDefault()
        
        "mousemove.ElementMouseTracker": (event) ->
          self.pos = 
            x: event.pageX
            y: event.pageY
          
          $.v.each self.activeInstances(), (inst) ->
            inst.triggerHandler "mousemove", event
          
          event.preventDefault()
    
    destroy: ->
      self = this
      $(document).unbind [ "mouseup.ElementMouseTracker", "mousemove.ElementMouseTracker" ].join(" ")
      self.debugDiv().hide()
    
    add: ($element, options) ->
      self = this
      self.init()  if self.instances.length == 0
      instance = new ElementMouseTracker.instance($element, options)
      self.instances.push instance
      instance
    
    remove: (instance) ->
      self = this
      index = $.v.indexOf(self.instances, instance)
      instance.destroy()
      self.instances.splice index, 1
      delete self.activeInstance.mouseWithin  if self.activeInstance.mouseWithin == instance
      delete self.activeInstance.mouseHeldWithin  if self.activeInstance.mouseHeldWithin == instance
      self.destroy()  if self.instances.length == 0
    
    debugDiv: ->
      self = this
      return self.$debugDiv  if self.$debugDiv
      self.$debugDiv = $("<div \"/>").html("&nbsp;").css(
        position: "absolute"
        top: 0
        left: 0
        padding: "2px"
        "background-color": "lightyellow"
        width: "200px"
        height: "50px"
      )
      $(document.body).append self.$debugDiv
      self.$debugDiv
    
    activeInstances: ->
      self = this
      instances = [ self.activeInstance.mouseHeldWithin, self.activeInstance.mouseWithin ]
      $.v(instances).chain().compact().uniq().value()
  
  ElementMouseTracker.instance = ($element, options) ->
    self = this
    self.$element = $element
    self.options = {}
    self.customEvents = {}
    $.v.each options, (keys, val) ->
      $.v.each keys.split(" "), (key) ->
        if /^mouse/.test(key)
          self.customEvents[key] = val
        else
          self.options[key] = val
    
    self.options.draggingDistance = 1  if typeof self.options.draggingDistance == "undefined"
    self.pos = 
      abs: 
        x: null
        y: null
      
      rel: 
        x: null
        y: null
    
    self.isDown = false
    self.downAt = 
      abs: 
        x: null
        y: null
      
      rel: 
        x: null
        y: null
    
    self.isDragging = false
    self._addEvents()
    self.elementOffset = self.$element.absoluteOffset()
    computedStyle = self.$element.computedStyle()
    self.elementSize = 
      width: parseInt(computedStyle["width"], 10)
      height: parseInt(computedStyle["height"], 10)
  
  ElementMouseTracker.instance:: = 
    destroy: ->
      self = this
      self._removeEvents()
    
    triggerHandler: (eventName, event) ->
      self = this
      if /(up|stop|leave)$/.test(eventName)
        self.customEvents[eventName].call self, event  if self.customEvents[eventName]
        self[eventName].call self, event  if self[eventName]
      else
        self[eventName].call self, event  if self[eventName]
        self.customEvents[eventName].call self, event  if self.customEvents[eventName]
    
    mousemove: (event) ->
      self = this
      self._setMousePosition()
      if self.isDown
        if self.isDragging
          dist = self._distance(self.downAt.abs, self.pos.abs)
          self.isDragging = (dist >= self.options.draggingDistance)
          self.triggerHandler "mousedragstart", event
      else
        self.isDragging = false
        self.triggerHandler "mouseglide", event
      self.triggerHandler "mousedrag", event  if self.isDragging
      ElementMouseTracker.debugDiv().html String.format("abs: ({0}, {1})<br/>rel: ({2}, {3})", self.pos.abs.x, self.pos.abs.y, self.pos.rel.x, self.pos.rel.y)  if self.options.debug
    
    mousedragstop: (event) ->
      self = this
      self.isDragging = false
    
    mouseup: (event) ->
      self = this
      self.isDown = false
      delete ElementMouseTracker.activeInstance.mouseHeldWithin
      
      ElementMouseTracker.debugDiv().hide()  if self.options.debug
    
    _setMousePosition: ->
      self = this
      self.pos = 
        abs: ElementMouseTracker.pos
        rel: 
          x: event.pageX - self.elementOffset.left
          y: event.pageY - self.elementOffset.top
      
      if self.pos.rel.x < 0
        self.pos.rel.x = 0
      else self.pos.rel.x = self.elementSize.width  if self.pos.rel.x > self.elementSize.width
      if self.pos.rel.y < 0
        self.pos.rel.y = 0
      else self.pos.rel.y = self.elementSize.height  if self.pos.rel.y > self.elementSize.height
    
    _addEvents: ->
      self = this
      self.$element.bind 
        "mouseover.ElementMouseTracker": (event) ->
          self.triggerHandler "mouseover", event
        
        "mouseout.ElementMouseTracker": (event) ->
          self.triggerHandler "mouseout", event
        
        "mouseenter.ElementMouseTracker": (event) ->
          ElementMouseTracker.activeInstance.mouseWithin = self
          self.triggerHandler "mouseenter", event
        
        "mouseleave.ElementMouseTracker": (event) ->
          delete ElementMouseTracker.activeInstance.mouseWithin
          
          self.triggerHandler "mouseleave", event
        
        "mousedown.ElementMouseTracker": (event) ->
          ElementMouseTracker.activeInstance.mouseHeldWithin = self
          self.isDown = true
          self._setMousePosition()
          self.downAt = 
            abs: 
              x: event.pageX
              y: event.pageY
            
            rel: 
              x: event.pageX - self.elementOffset.left
              y: event.pageY - self.elementOffset.top
          
          ElementMouseTracker.debugDiv().show()  if self.options.debug
          self.triggerHandler "mousedown", event
          event.preventDefault()
        
        "click.ElementMouseTracker": (event) ->
          self.triggerHandler "mouseclick", event
          event.preventDefault()
        
        "contextmenu.ElementMouseTracker": (event) ->
          self.triggerHandler "contextmenu", event
          event.preventDefault()
    
    _removeEvents: ->
      self = this
      self.$element.unbind [ "mouseover.ElementMouseTracker", "mouseout.ElementMouseTracker", "mouseenter.ElementMouseTracker", "mouseleave.ElementMouseTracker", "mousedown.ElementMouseTracker", "click.ElementMouseTracker", "contextmenu.ElementMouseTracker" ].join(" ")
    
    _distance: (v1, v2) ->
      Math.floor Math.sqrt(Math.pow((v2.y - v1.y), 2) + Math.pow((v2.x - v1.x), 2))
  
  $.export "SpriteEditor.ElementMouseTracker", ElementMouseTracker
  $.ender mouseTracker: ->
    if @data("mouseTracker")
      mouseTracker = @data("mouseTracker")
    else if $.v.is.obj(arguments[0])
      mouseTracker = ElementMouseTracker.add(this, arguments[0])
      @data "mouseTracker", mouseTracker
    if typeof arguments[0] == "string"
      if arguments[0] == "destroy"
        ElementMouseTracker.remove mouseTracker
        @data "mouseTracker", null
      else if arguments[0] == "__instance__"
        return mouseTracker
      else
        value = mouseTracker[arguments[0]]
        if typeof value == "function"
          return value.apply(mouseTracker, Array::slice.call(arguments, 1))
        else if typeof value == "undefined"
          return value
        else
          throw "'" + arguments[0] + "' is not a property of ElementMouseTracker!"
    this
  , true
) window, window.document, window.ender
