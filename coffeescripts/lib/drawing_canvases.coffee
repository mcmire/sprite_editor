$.export "SpriteEditor.DrawingCanvases", do ->

  Keyboard = SpriteEditor.Keyboard

  DrawingCanvases = {}
  SpriteEditor.DOMEventHelpers.mixin(DrawingCanvases, "SpriteEditor_DrawingCanvases")
  $.extend(DrawingCanvases, SpriteEditor.Eventable)

  $.extend DrawingCanvases,
    timer: null
    width: null
    height: null
    workingCanvas: null
    gridBgCanvas: null
    previewCanvas: null
    cells: []
    focusedCell: null
    focusedCells: []
    startDragAtCell: null
    clipboard: []

    tickInterval: 80    # ms/frame
    widthInCells: 16    # cells
    heightInCells: 16   # cells
    cellSize: 30        # pixels

    init: (app) ->
      @app = app

      @_initCells()
      @_createGridBgCanvas()
      @_createWorkingCanvas()
      @_createPreviewCanvases()
      @autoSaveTimer = setInterval((=> @save()), 30000)

      return this

    destroy: ->
      @removeEvents()

    start: ->
      self = this
      return if @timer
      # We don't use => here because that would be a double function call
      # and thus (theoretically at least) slow down the draw by 50%
      @timer = setInterval((-> self.draw()), @tickInterval)
      return this

    draw: ->
      @_clearWorkingCanvas()
      @_clearPreviewCanvas()
      @_clearTiledPreviewCanvas()
      @_fillCells()
      @_highlightFocusedCells()
      @app.currentTool()?.draw()
      @_updateTiledPreviewCanvas()

    stop: ->
      return unless @timer
      clearInterval(@timer)
      @timer = null
      return this

    save: ->
      localStorage.setItem("pixel_editor.saved", "true")
      for row in @cells
        for cell in row
          cellJSON = JSON.stringify(cell.color)
          localStorage.setItem("cells."+cell.coords(), cellJSON)

    # TODO: Keep this?
    updateCell: (cell) ->
      @cells[cell.i][cell.j] = cell.clone()

    _initCells: ->
      needsReload = (localStorage.getItem("pixel_editor.saved") == "true")
      for i in [0...@heightInCells]
        row = @cells[i] = []
        for j in [0...@widthInCells]
          row[j] = new SpriteEditor.Cell(this, i, j)
          if needsReload
            color = JSON.parse(localStorage["cells." + j + "," + i])
            row[j].color = new SpriteEditor.Color.HSL(color)

    addEvents: ->
      self = this
      @workingCanvas.$element.mouseTracker
        mouseout: (event) ->
          self._unsetFocusedCells()
          self.draw()
        mousedown: (event) ->
          self.app.currentTool().trigger("mousedown", event)
          event.preventDefault()
        mouseup: (event) ->
          self.app.currentTool().trigger("mouseup", event)
          event.preventDefault()
        mousemove: (event) ->
          mouse = self.workingCanvas.$element.mouseTracker("pos")
          self._setFocusedCell(mouse)
          self._setFocusedCells(mouse)
        mousedragstart: (event) ->
          self.startDragAtCell = self.focusedCell.clone()
          self.app.currentTool().trigger("mousedragstart", event)
        mousedragstop: (event) ->
          self.startDragAtCell = null
          self.app.currentTool().trigger("mousedragstop", event)
        mousedrag: (event) ->
          self.app.currentTool().trigger("mousedrag", event)
        mouseglide: (event) ->
          self.app.currentTool().trigger("mouseglide", event)

      @_bindEvents window,
        blur: ->
          self.stop()
        focus: ->
          self.start()

      @start()

    removeEvents: ->
      @workingCanvas.$element.mouseTracker("destroy")
      @_unbindEvents(window, "blur", "focus")
      @stop()

    drawCell: (cell, opts) ->
      @drawWorkingCell(cell, opts)
      @drawPreviewCell(cell)

    drawWorkingCell: (cell, opts={}) ->
      wc = @workingCanvas
      color = opts.color || cell.color
      loc = opts.loc || cell.loc
      if typeof color isnt "string"
        return if color.isClear()
        color = color.toRGB().toString()
      wc.ctx.fillStyle = color
      wc.ctx.fillRect(loc.x + 1, loc.y + 1, @cellSize - 1, @cellSize - 1)

    drawPreviewCell: (cell) ->
      pc = @previewCanvas
      color = cell.color.toRGB()
      return if color.isClear()
      pc.imageData.setPixel(cell.loc.j, cell.loc.i, color.red, color.green, color.blue, 255)

    _createGridBgCanvas: ->
      @gridBgCanvas = SpriteEditor.Canvas.create @cellSize, @cellSize, (c) =>
        c.ctx.strokeStyle = "#eee"
        c.ctx.beginPath()
        # Draw a vertical line on the left
        # We use 0.5 instead of 0 because this is the midpoint of the path we want to stroke
        # See: <http://diveintohtml5.org/canvas.html#pixel-madness>
        c.ctx.moveTo(0.5, 0)
        c.ctx.lineTo(0.5, @cellSize)
        # Draw a horizontal line on top
        c.ctx.moveTo(0, 0.5)
        c.ctx.lineTo(@cellSize, 0.5)
        c.ctx.stroke()
        c.ctx.closePath()

    _createWorkingCanvas: ->
      @width = @widthInCells * @cellSize
      @height = @heightInCells * @cellSize
      @workingCanvas = SpriteEditor.Canvas.create(@width, @height)
      @workingCanvas.$element
        .attr("id", "working_canvas")
        .css("background-image", "url(" + @gridBgCanvas.element.toDataURL("image/png") + ")")

    _createPreviewCanvases: ->
      @previewCanvas = SpriteEditor.Canvas.create(@widthInCells, @heightInCells)
      @previewCanvas.element.id = "preview_canvas"
      @tiledPreviewCanvas = SpriteEditor.Canvas.create(@widthInCells * 9, @heightInCells * 9)
      @tiledPreviewCanvas.element.id = "tiled_preview_canvas"

    _setFocusedCell: (mouse) ->
      x = mouse.rel.x
      y = mouse.rel.y

      j = Math.floor(x / @cellSize)
      i = Math.floor(y / @cellSize)

      @focusedCell = @cells[i][j]

    _setFocusedCells: (mouse) ->
      bs = (@app.currentBrushSize - 1) * @cellSize
      x = mouse.rel.x
      y = mouse.rel.y

      focusedCells = []
      # Make a bounding box of pixels within the working canvas based on
      # the brush size
      x1 = x - (bs / 2)
      x2 = x + (bs / 2)
      y1 = y - (bs / 2)
      y2 = y + (bs / 2)
      # Scale each coordinate on the working canvas down to the coordinate
      # on the preview canvas (which also serves as the cell coordinate
      # within the cells array-of-arrays)
      j1 = Math.floor(x1 / @cellSize)
      j2 = Math.floor(x2 / @cellSize)
      i1 = Math.floor(y1 / @cellSize)
      i2 = Math.floor(y2 / @cellSize)
      # Now that we have a bounding box of cells, enumerate through all
      # cells in the box and add them to the set of current cells
      for i in [i1..i2]
        for j in [j1..j2]
          row = @cells[i]
          focusedCells.push(row[j]) if row && row[j]
      @focusedCells = focusedCells

    _unsetFocusedCells: ->
      @focusedCells = null

    _clearWorkingCanvas: ->
      wc = @workingCanvas
      wc.ctx.clearRect(0, 0, wc.width, wc.height)

    _clearPreviewCanvas: ->
      pc = @previewCanvas
      # clearRect() won't clear image data set using createImageData(),
      # so this is another way to clear the canvas that works
      pc.element.width = pc.width
      pc.imageData = pc.ctx.createImageData(@widthInCells, @heightInCells)

    _clearTiledPreviewCanvas: ->
      ptc = @tiledPreviewCanvas
      ptc.ctx.clearRect(0, 0, ptc.width, ptc.height)

    _highlightFocusedCells: ->
      ctx = @workingCanvas.ctx
      isDragging = @workingCanvas.$element.mouseTracker("isDragging")
      if @focusedCells and not (isDragging or Keyboard.pressedKeys[Keyboard.CTRL_KEY]) and @app.currentToolName == "pencil"
        currentColor = @app.currentColor[@app.currentColor.type]
        ctx.save()
        for cell in @focusedCells
          # If a cell is already filled in, fill it in with white before
          # filling it with the current color, since we want to let the user
          # know which color each cell would get replaced with
          # TODO: We really need to "un-draw" the cell first; how?
          @drawWorkingCell(cell, color: "#fff")
          @drawWorkingCell(cell, color: currentColor.with(alpha: 0.5))
        ctx.restore()

    _fillCells: ->
      wc = @workingCanvas
      pc = @previewCanvas
      wc.ctx.save()
      for row in @cells
        for origCell in row
          customCell = @app.currentTool().trigger("cellToDraw", origCell)
          @drawCell(customCell || origCell)
      wc.ctx.restore()
      pc.ctx.putImageData(pc.imageData, 0, 0)

    _updateTiledPreviewCanvas: ->
      tpc = @tiledPreviewCanvas
      pattern = tpc.ctx.createPattern(@previewCanvas.element, "repeat")
      tpc.ctx.save()
      tpc.ctx.fillStyle = pattern
      tpc.ctx.fillRect(0, 0, tpc.width, tpc.height)
      tpc.ctx.restore()

  return DrawingCanvases