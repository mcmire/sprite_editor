$.export "SpriteEditor.Cell", (SpriteEditor) ->

  # new Cell(app, i, j)
  # new Cell(cell)
  #
  class Cell
    constructor: ->
      if arguments.length == 1 and $.v.is.obj(arguments[0])
        obj = arguments[0]
        @app   = obj.app
        @loc   = obj.loc?.clone()
        @color = obj.color?.clone()
      else
        @app = arguments[0]
        @loc = new SpriteEditor.CellLocation(arguments[0], arguments[1], arguments[2])
        @color = new SpriteEditor.Color.HSL()

    clear: ->
      @color = new SpriteEditor.Color.HSL()
      return this

    asClear: ->
      @clone().clear()

    withColor: (color) ->
      clone = @clone()
      clone.color = color.clone()
      clone

    coords: -> [ @loc.j, @loc.i ].join(",")

    clone: -> new Cell(this)

  return Cell