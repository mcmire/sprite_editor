$.export "SpriteEditor.DrawingCanvases", (SpriteEditor) ->

  Keyboard = SpriteEditor.Keyboard
  Canvas   = SpriteEditor.Canvas

  DrawingCanvases = {}
  SpriteEditor.DOMEventHelpers.mixin(DrawingCanvases, "SpriteEditor_DrawingCanvases")
  $.extend(DrawingCanvases, SpriteEditor.Eventable)

  defaults =
    drawInterval: 80    # ms/frame
    saveInterval: 3000  # ms
    widthInCells: 16    # cells
    heightInCells: 16   # cells
    cellSize: 30        # pixels
    showGrid: true
    patternSize: 9      # no. of times to repeat the actual image to form the preview

  $.extend DrawingCanvases,
    init: (app, options={}) ->
      @app = app
      @reset()
      $.extend(this, defaults, options)

      @_initCells()
      @_createGridBgCanvas() if @showGrid
      @_createWorkingCanvas()
      @_createPreviewCanvases()
      #@startSaving

      return this

    destroy: ->
      @removeEvents()
      @reset()
      # Ensure that the localStorage values we are saving are cleared
      localStorage.removeItem("sprite_editor.saved")
      localStorage.removeItem("sprite_editor.cells")

    reset: ->
      @stopDrawing()
      @stopSaving()
      @width = null
      @height = null
      @workingCanvas = null
      @gridBgCanvas = null
      @previewCanvas = null
      @cells = []
      @focusedCell = null
      @focusedCells = []
      @startDragAtCell = null
      @clipboard = []
      @stateBeforeSuspend = null
      return this

    startDrawing: ->
      self = this
      unless @isDrawing
        @isDrawing = true
        @_keepDrawing()
      return this

    draw: ->
      # Somehow variables are getting reset in our tests while the draw loop is
      # still active, so check for that
      return unless @workingCanvas
      @_clearWorkingCanvas()
      @_clearPreviewCanvas()
      @_clearTiledPreviewCanvas()
      @_fillCells()
      @app.boxes.tools.currentTool().draw?()
      @_updateTiledPreviewCanvas()
      return this

    _keepDrawing: ->
      self = this
      @draw()
      # Use setTimeout here instead of setInterval so we can guarantee that
      # we can stop the loop (say, in tests)
      setTimeout((-> self._keepDrawing()), @drawInterval) if @isDrawing

    stopDrawing: ->
      @isDrawing = false
      return this

    startSaving: ->
      self = this
      unless @isSaving
        @isSaving = true
        @_keepSaving()
      return this

    save: ->
      console.log "Saving..." unless window.RUNNING_TESTS
      cells = {}
      cells[cell.coords()] = cell.color.asJSON() for cell in row for row in @cells
      localStorage.setItem("sprite_editor.cells", JSON.stringify(cells))
      localStorage.setItem("sprite_editor.saved", "true")

    _keepSaving: ->
      self = this
      @save()
      # Use setTimeout here instead of setInterval so we can guarantee that
      # we can stop the loop (say, in tests)
      setTimeout((-> self._keepSaving()), @saveInterval) if @isSaving

    stopSaving: ->
      if @isSaving
        clearInterval(@isSaving)
        @isSaving = null
      return this

    suspend: ->
      unless @stateBeforeSuspend
        @stateBeforeSuspend = {wasDrawing: !!@isDrawing, wasSaving: !!@isSaving}
        @stopDrawing()
        @stopSaving()

    resume: ->
      if @stateBeforeSuspend
        @startDrawing() if @stateBeforeSuspend.wasDrawing
        @startSaving()  if @stateBeforeSuspend.wasSaving
        @stateBeforeSuspend = null

    addEvents: ->
      self = this

      @startDrawing()

      @workingCanvas.$element.mouseTracker
        mousedown: (event) ->
          self.app.boxes.tools.currentTool().trigger("mousedown", event)
          event.preventDefault()
        mouseup: (event) ->
          self.app.boxes.tools.currentTool().trigger("mouseup", event)
          event.preventDefault()
        mousemove: (event) ->
          self.app.boxes.tools.currentTool().trigger("mousemove", event)
          mouse = self.workingCanvas.$element.mouseTracker("pos")
          self._setFocusedCell(mouse)
          self._setFocusedCells(mouse)
        mousedragstart: (event) ->
          self.startDragAtCell = self.focusedCell.clone()
          self.app.boxes.tools.currentTool().trigger("mousedragstart", event)
        mousedrag: (event) ->
          self.app.boxes.tools.currentTool().trigger("mousedrag", event)
        mousedragstop: (event) ->
          self.startDragAtCell = null
          self.app.boxes.tools.currentTool().trigger("mousedragstop", event)
        mouseglide: (event) ->
          self.app.boxes.tools.currentTool().trigger("mouseglide", event)
        mouseout: (event) ->
          self.app.boxes.tools.currentTool().trigger("mouseout", event)
          self._unsetFocusedCell()
          self._unsetFocusedCells()
          self.draw()
        draggingDistance: 3

      @_bindEvents window,
        blur: ->
          self.suspend()
        focus: ->
          self.resume()

    removeEvents: ->
      @stopDrawing()
      @workingCanvas?.$element.mouseTracker("destroy")
      @_unbindEvents(window, "blur", "focus")

    drawCell: (cell, opts) ->
      @drawWorkingCell(cell, opts)
      @drawPreviewCell(cell)

    drawWorkingCell: (cell, opts={}) ->
      wc = @workingCanvas
      color = opts.color || cell.color
      loc = opts.loc || cell.loc
      if typeof color isnt "string"
        return if color.isClear()
        color = color.toRGBAString()
      wc.ctx.fillStyle = color
      if @showGrid
        wc.ctx.fillRect(loc.x + 1, loc.y + 1, @cellSize - 1, @cellSize - 1)
      else
        wc.ctx.fillRect(loc.x, loc.y, @cellSize, @cellSize)

    drawPreviewCell: (cell) ->
      pc = @previewCanvas
      color = cell.color
      return if color.isClear()
      pc.imageData.setPixel(cell.loc.j, cell.loc.i, color.red, color.green, color.blue, 255)

    _initCells: ->
      json = localStorage.getItem("sprite_editor.cells")
      cells = JSON.parse(json) if json
      for i in [0...@heightInCells]
        row = @cells[i] = []
        for j in [0...@widthInCells]
          cell = row[j] = new SpriteEditor.Cell(this, i, j)
          if cells
            color = cells[cell.coords()]
            row[j].color = new SpriteEditor.Color(color)

    _createGridBgCanvas: ->
      @gridBgCanvas = Canvas.create @cellSize, @cellSize, (c) =>
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
      @workingCanvas = Canvas.create(@width, @height)
      @workingCanvas.$element.attr("id", "working_canvas")
      if @showGrid
        @workingCanvas.$element.css("background-image", "url(" + @gridBgCanvas.element.toDataURL("image/png") + ")")

    _createPreviewCanvases: ->
      @previewCanvas = Canvas.create(@widthInCells, @heightInCells)
      @previewCanvas.element.id = "preview_canvas"
      @tiledPreviewCanvas = Canvas.create(@widthInCells * @patternSize, @heightInCells * @patternSize)
      @tiledPreviewCanvas.element.id = "tiled_preview_canvas"

    _setFocusedCell: (mouse) ->
      x = mouse.rel.x
      y = mouse.rel.y

      j = Math.floor(x / @cellSize)
      i = Math.floor(y / @cellSize)

      #console.log("x: #{x}, y: #{y}, i: #{i}, j: #{j}, cellSize: #{@cellSize}")

      @focusedCell = @cells[i][j]

    _setFocusedCells: (mouse) ->
      bs = (@app.boxes.sizes.currentSize - 1) * @cellSize
      x = mouse.rel.x
      y = mouse.rel.y

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
      focusedCells = {}
      for i in [i1..i2]
        for j in [j1..j2]
          row = @cells[i]
          cell = row[j] if row
          focusedCells[cell.coords()] = cell if cell
      @focusedCells = focusedCells

    _unsetFocusedCell: ->
      @focusedCell = null

    _unsetFocusedCells: ->
      @focusedCells = []

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

    _fillCells: ->
      [wc, pc] = [@workingCanvas, @previewCanvas]
      wc.ctx.save()
      for row in @cells
        for cell in row
          # Allow custom cell options -- this is used by the pencil tool
          throw new Error("app.boxes is not defined!") unless @app.boxes?
          opts = @app.boxes.tools.currentTool().trigger("cellOptions", cell) || {}
          @drawCell(cell, opts)
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