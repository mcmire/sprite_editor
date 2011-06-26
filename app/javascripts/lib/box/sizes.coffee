$.export "SpriteEditor.Box.Sizes", (SpriteEditor) ->

  Keyboard = SpriteEditor.Keyboard

  Sizes = {}
  SpriteEditor.DOMEventHelpers.mixin(Sizes, "SpriteEditor_Box_Sizes")

  $.extend Sizes,
    name: "Sizes"
    header: "Sizes"

    sizes: [1..4]

    init: (app) ->
      SpriteEditor.Box.init.call(this, app)

      @sizeGrids = {}
      for size in @sizes
        ((self, size) ->
          grid = self._createGrid(self.app.canvases.cellSize * size)
          self.sizeGrids[size] = grid.$element
          self.$element.append(grid.$element)
          grid.$element.bind "click", -> self.select(size)
        )(this, size)

      @reset()

      return this

    destroy: ->
      SpriteEditor.Box.destroy.call(this)
      @currentSize = null
      @removeEvents()
      return this

    reset: ->
      @select(@sizes[0])

    addEvents: ->
      @_bindEvents document,
        keydown: (event) =>
          key = event.keyCode
          switch key
            when Keyboard.KEY_1
              @select(1)
            when Keyboard.KEY_2
              @select(2)
            when Keyboard.KEY_3
              @select(3)
            when Keyboard.KEY_4
              @select(4)

    removeEvents: ->
      @_unbindEvents(document, "keydown")

    select: (size) ->
      return if size is @currentSize
      if @currentSize
        @sizeGrids[@currentSize].removeClass("selected")
      @currentSize = size
      @sizeGrids[size].addClass("selected")

    _createGrid: (size) ->
      SpriteEditor.Canvas.create size, size, (c) =>
        cellSize = @app.canvases.cellSize

        c.ctx.strokeStyle = "#eee"
        c.ctx.beginPath()
        # Draw vertical lines
        # We start at 0.5 because this is the midpoint of the path we want to stroke
        # See: <http://diveintohtml5.org/canvas.html#pixel-madness>
        for x in [0.5...size] by cellSize
          c.ctx.moveTo(x, 0)
          c.ctx.lineTo(x, size)
        # Draw horizontal lines
        for y in [0.5...size] by cellSize
          c.ctx.moveTo(0, y)
          c.ctx.lineTo(size, y)
        c.ctx.stroke()
        c.ctx.closePath()

        fontSize = 11
        c.ctx.font = "#{fontSize} px Helvetica"
        text = (size / cellSize) + "px"
        # Place the text that indicates the brush size in the center of the canvas
        # I don't know why I have to put "/4" here, but I do...
        metrics = c.ctx.measureText(text)
        c.ctx.fillText(text, size/2 - metrics.width/2, size/2 + fontSize/4)

  return Sizes