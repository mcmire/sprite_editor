$.export "SpriteEditor.CellLocation", do ->

  # Represents the location of a cell.
  #
  # `i` and `j` are coordinates in the preview canvas (or row-column keys in
  # the cell array). `x` and `y` are coordinates in the working canvas.
  #
  # == Call signatures
  #
  #   new CellLocation(app, i, j)
  #   new CellLocation(obj)
  #
  class CellLocation
    @plus: (l1, l2) -> l1.plus(l2)
    @add: -> @plus.apply(@, arguments)
    @minus: (l1, l2) -> l1.minus(l2)
    @subtract: -> @minus.apply(@, arguments)

    constructor: ->
      if arguments.length == 1 and $.v.is.obj(arguments[0])
        obj  = arguments[0]
        [@app, @i, @j, @x, @y] = [obj.app, obj.i, obj.j, obj.x, obj.y]
      else
        [@app, @i, @j] = arguments
      @_calculateXandY() unless @x? or @y?

    add: (offset) ->
      if offset.i? and offset.j?
        @i += offset.i
        @j += offset.j
        @_calculateXandY()
      else if offset.x? and offset.y?
        @x += offset.x
        @y += offset.y
        @_calculateIandJ()
      return this

    plus: (offset) -> @.clone().add(offset)

    subtract: (offset) ->
      if offset.i? and offset.j?
        @i -= offset.i
        @j -= offset.j
        @_calculateXandY()
      else if offset.x? and offset.y?
        @x -= offset.x
        @y -= offset.y
        @_calculateIandJ()
      return this

    minus: (offset) -> @clone().subtract(offset)

    gt: (other) -> (@i > other.i or @j > other.j)

    clone: -> new CellLocation(this)

    # Necessary?
    toJSON: -> JSON.stringify(x: @x, y: @y, i: @i, j: @j)

    _calculateXandY: ->
      @x = @j * @app.cellSize
      @y = @i * @app.cellSize

    _calculateIandJ: ->
      @i = @y / @app.cellSize
      @j = @x / @app.cellSize