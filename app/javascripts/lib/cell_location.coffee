$.export "SpriteEditor.CellLocation", (SpriteEditor) ->

  # new CellLocation(app, i, j)
  # new CellLocation(obj)
  #
  # Represents the location of a cell.
  #
  # `i` and `j` are coordinates in the preview canvas (or row-column keys in
  # the cell array). `x` and `y` are coordinates in the working canvas.
  #
  class CellLocation
    @plus: (l1, l2) -> l1.plus(l2)
    @add: -> @plus.apply(@, arguments)
    @minus: (l1, l2) -> l1.minus(l2)
    @subtract: -> @minus.apply(@, arguments)

    constructor: ->
      if arguments.length == 1 and $.v.is.obj(arguments[0])
        obj = arguments[0]
        @app = obj.app
        obj = @_handleCoordsObject(obj, 'CellLocation')
        {@i, @j, @x, @y} = obj
      else
        [@app, @i, @j] = arguments
        $.extend @_fillOutCoords(this)

    add: (offset) ->
      offset = @_fillOutCoords(offset)
      @i += offset.i if offset.i?
      @j += offset.j if offset.j?
      @x += offset.x if offset.x?
      @y += offset.y if offset.y?
      return this

    plus: (offset) ->
      @clone().add(offset)

    subtract: (offset) ->
      offset = @_fillOutCoords(offset)
      @i -= offset.i if offset.i?
      @j -= offset.j if offset.j?
      @x -= offset.x if offset.x?
      @y -= offset.y if offset.y?
      return this

    minus: (offset) ->
      @clone().subtract(offset)

    gt: (other) ->
      (@i > other.i or @j > other.j)

    clone: -> new CellLocation(this)

    # Necessary?
    toJSON: -> JSON.stringify(x: @x, y: @y, i: @i, j: @j)

    inspect: -> "(#{@i}, #{@j})"

    _handleCoordsObject: (obj, sig) ->
      unless obj instanceof CellLocation
        @_validateCoords(obj, sig)
        obj = @_fillOutCoords(obj)
      obj

    _validateCoords: (obj, sig) ->
      count = 0
      count += 1 if obj.x?
      count += 2 if obj.y?
      count += 3 if obj.i?
      count += 4 if obj.j?
      if count is 5
        throw "#{sig} accepts an object containing either i and j or x and y, but not a mixture!"
      if count is 0
        throw "An object passed to #{sig} must contain i and j and/or x and y!"

    _fillOutCoords: (obj) ->
      obj = $.extend(obj)
      obj.x = obj.j * @app.cellSize if obj.j? && !obj.x?
      obj.y = obj.i * @app.cellSize if obj.i? && !obj.y?
      obj.i = obj.y / @app.cellSize if obj.y? && !obj.i?
      obj.j = obj.x / @app.cellSize if obj.x? && !obj.j?
      obj