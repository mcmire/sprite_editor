((window, document, $, undefined_) ->
  CellLocation = ->
    self = this
    if arguments.length == 1
      obj = arguments[0]
      self.app = obj.app
      self.i = obj.i
      self.j = obj.j
      self.x = obj.x
      self.y = obj.y
    else
      self.app = arguments[0]
      self.i = arguments[1]
      self.j = arguments[2]
    self._calculateXandY()  if typeof self.x == "undefined" and typeof self.y == "undefined"
  
  $.extend CellLocation, 
    plus: (l1, l2) ->
      l1.plus l2
    
    add: ->
      @plus.apply this, arguments
    
    minus: (l1, l2) ->
      l1.minus l2
    
    subtract: ->
      @minus.apply this, arguments
  
  $.extend CellLocation::, 
    add: (offset) ->
      self = this
      if typeof offset.x == "undefined" and typeof offset.y == "undefined"
        self.x += offset.x
        self.y += offset.y
        self._calculateIandJ()
      else
        self.i += offset.i
        self.j += offset.j
        self._calculateXandY()
    
    plus: (offset) ->
      self = this
      clone = self.clone()
      clone.add offset
      clone
    
    subtract: (offset) ->
      self = this
      if typeof offset.x == "undefined" and typeof offset.y == "undefined"
        self.x -= offset.x
        self.y -= offset.y
        self._calculateIandJ()
      else
        self.i -= offset.i
        self.j -= offset.j
        self._calculateXandY()
    
    minus: (offset) ->
      self = this
      clone = self.clone()
      clone.subtract offset
      clone
    
    gt: (other) ->
      self = this
      self.i > other.i or self.j > other.j
    
    clone: ->
      self = this
      loc = new CellLocation(self)
      loc
    
    toJSON: ->
      self = this
      JSON.stringify 
        x: self.x
        y: self.y
        i: self.i
        j: self.j
    
    _calculateXandY: ->
      self = this
      self.x = self.j * self.app.cellSize
      self.y = self.i * self.app.cellSize
    
    _calculateIandJ: ->
      self = this
      self.i = self.y / self.app.cellSize
      self.j = self.x / self.app.cellSize
  
  $.export "SpriteEditor.CellLocation", CellLocation
) window, window.document, window.ender
