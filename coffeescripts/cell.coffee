((window, document, $, undefined_) ->
  Cell = ->
    self = this
    if arguments.length == 1
      obj = arguments[0]
      self.app = obj.app
      self.loc = obj.loc.clone()  if obj.loc
      self.color = obj.color.clone()  if obj.color
    else
      self.app = arguments[0]
      self.loc = new SpriteEditor.CellLocation(arguments[0], arguments[1], arguments[2])
      self.color = new SpriteEditor.Color.HSL()
  
  $.extend Cell::, 
    clear: ->
      self = this
      self.color = new SpriteEditor.Color.HSL()
    
    asClear: ->
      self = this
      clone = self.clone()
      clone.clear()
      clone
    
    withColor: (color) ->
      self = this
      clone = self.clone()
      clone.color = color.clone()
      clone
    
    coords: ->
      self = this
      [ self.loc.j, self.loc.i ].join ","
    
    clone: ->
      self = this
      cell = new Cell(self)
      cell
  
  $.export "SpriteEditor.Cell", Cell
) window, window.document, window.ender
