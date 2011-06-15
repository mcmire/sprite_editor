((window, document, $, undefined_) ->
  DrawingCanvases = (->
    canvases = {}
    SpriteEditor.DOMEventHelpers.mixin canvases, "SpriteEditor_DrawingCanvases"
    $.extend canvases, SpriteEditor.Eventable
    $.extend canvases, 
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
      tickInterval: 80
      widthInCells: 16
      heightInCells: 16
      cellSize: 30
    
    $.extend canvases, 
      init: (app) ->
        self = this
        self.app = app
        self._initCells()
        self._createGridBgCanvas()
        self._createWorkingCanvas()
        self._createPreviewCanvases()
        self.autoSaveTimer = setInterval(->
          self.save()
        , 30000)
        self
      
      destroy: ->
        self = this
        self.removeEvents()
      
      start: ->
        self = this
        return  if self.timer
        self.timer = setInterval(->
          self.draw()
        , self.tickInterval)
        self
      
      draw: ->
        self = this
        self._clearWorkingCanvas()
        self._clearPreviewCanvas()
        self._clearTiledPreviewCanvas()
        self._fillCells()
        self._highlightFocusedCells()
        tool = self.app.currentTool()
        tool.draw()  unless typeof tool.draw == "undefined"
        self._updateTiledPreviewCanvas()
      
      stop: ->
        self = this
        return  unless self.timer
        clearInterval self.timer
        self.timer = null
        self
      
      save: ->
        self = this
        localStorage.setItem "pixel_editor.saved", "true"
        $.v.each self.cells, (row) ->
          $.v.each row, (cell) ->
            cellJSON = cell.color
            localStorage.setItem "cells." + cell.coords(), JSON.stringify(cellJSON)
      
      updateCell: (cell) ->
        self = this
        self.cells[cell.i][cell.j] = cell.clone()
      
      _initCells: ->
        self = this
        needsReload = (localStorage.getItem("pixel_editor.saved") == "true")
        i = 0
        
        while i < self.heightInCells
          row = self.cells[i] = []
          j = 0
          
          while j < self.widthInCells
            row[j] = new SpriteEditor.Cell(self, i, j)
            row[j].color = new SpriteEditor.Color.HSL(JSON.parse(localStorage["cells." + j + "," + i]))  if needsReload
            j++
          i++
      
      addEvents: ->
        self = this
        self.workingCanvas.$element.mouseTracker 
          mouseover: (event) ->
          
          mouseout: (event) ->
            self._unsetFocusedCells()
            self.draw()
          
          mousedown: (event) ->
            self.app.currentTool().trigger "mousedown", event
            event.preventDefault()
          
          mouseup: (event) ->
            self.app.currentTool().trigger "mouseup", event
            event.preventDefault()
          
          mousemove: (event) ->
            mouse = self.workingCanvas.$element.mouseTracker("pos")
            self._setFocusedCell mouse
            self._setFocusedCells mouse
          
          mousedragstart: (event) ->
            self.startDragAtCell = self.focusedCell.clone()
            self.app.currentTool().trigger "mousedragstart", event
          
          mousedragstop: (event) ->
            self.startDragAtCell = null
            self.app.currentTool().trigger "mousedragstop", event
          
          mousedrag: (event) ->
            self.app.currentTool().trigger "mousedrag", event
          
          mouseglide: (event) ->
            self.app.currentTool().trigger "mouseglide", event
        
        self._bindEvents window, 
          blur: ->
            self.stop()
          
          focus: ->
            self.start()
        
        self.start()
      
      removeEvents: ->
        self = this
        self.workingCanvas.$element.mouseTracker "destroy"
        self._unbindEvents window, "blur", "focus"
        self.stop()
      
      drawCell: (cell, opts) ->
        self = this
        self.drawWorkingCell cell, opts
        self.drawPreviewCell cell
      
      drawWorkingCell: (cell, opts) ->
        self = this
        wc = self.workingCanvas
        opts = opts or {}
        color = opts.color or cell.color
        loc = opts.loc or cell.loc
        unless typeof color == "string"
          return  if color.isClear()
          color = color.toRGB().toString()
        wc.ctx.fillStyle = color
        wc.ctx.fillRect loc.x + 1, loc.y + 1, self.cellSize - 1, self.cellSize - 1
      
      drawPreviewCell: (cell) ->
        self = this
        pc = self.previewCanvas
        color = cell.color.toRGB()
        return  if color.isClear()
        pc.imageData.setPixel cell.loc.j, cell.loc.i, color.red, color.green, color.blue, 255
      
      _createGridBgCanvas: ->
        self = this
        self.gridBgCanvas = SpriteEditor.Canvas.create(self.cellSize, self.cellSize, (c) ->
          c.ctx.strokeStyle = "#eee"
          c.ctx.beginPath()
          c.ctx.moveTo 0.5, 0
          c.ctx.lineTo 0.5, self.cellSize
          c.ctx.moveTo 0, 0.5
          c.ctx.lineTo self.cellSize, 0.5
          c.ctx.stroke()
          c.ctx.closePath()
        )
      
      _createWorkingCanvas: ->
        self = this
        self.width = self.widthInCells * self.cellSize
        self.height = self.heightInCells * self.cellSize
        self.workingCanvas = SpriteEditor.Canvas.create(self.width, self.height)
        self.workingCanvas.$element.attr("id", "working_canvas").css "background-image", "url(" + self.gridBgCanvas.element.toDataURL("image/png") + ")"
      
      _createPreviewCanvases: ->
        self = this
        self.previewCanvas = SpriteEditor.Canvas.create(self.widthInCells, self.heightInCells)
        self.previewCanvas.element.id = "preview_canvas"
        self.tiledPreviewCanvas = SpriteEditor.Canvas.create(self.widthInCells * 9, self.heightInCells * 9)
        self.tiledPreviewCanvas.element.id = "tiled_preview_canvas"
      
      _setFocusedCell: (mouse) ->
        self = this
        x = mouse.rel.x
        y = mouse.rel.y
        j = Math.floor(x / self.cellSize)
        i = Math.floor(y / self.cellSize)
        self.focusedCell = self.cells[i][j]
      
      _setFocusedCells: (mouse) ->
        self = this
        bs = (self.app.currentBrushSize - 1) * self.cellSize
        x = mouse.rel.x
        y = mouse.rel.y
        focusedCells = []
        x1 = x - (bs / 2)
        x2 = x + (bs / 2)
        y1 = y - (bs / 2)
        y2 = y + (bs / 2)
        j1 = Math.floor(x1 / self.cellSize)
        j2 = Math.floor(x2 / self.cellSize)
        i1 = Math.floor(y1 / self.cellSize)
        i2 = Math.floor(y2 / self.cellSize)
        i = i1
        
        while i <= i2
          j = j1
          
          while j <= j2
            row = self.cells[i]
            focusedCells.push row[j]  if row and row[j]
            j++
          i++
        self.focusedCells = focusedCells
      
      _unsetFocusedCells: ->
        self = this
        self.focusedCells = null
      
      _clearWorkingCanvas: ->
        self = this
        wc = self.workingCanvas
        wc.ctx.clearRect 0, 0, wc.width, wc.height
      
      _clearPreviewCanvas: ->
        self = this
        pc = self.previewCanvas
        pc.element.width = pc.width
        pc.imageData = pc.ctx.createImageData(self.widthInCells, self.heightInCells)
      
      _clearTiledPreviewCanvas: ->
        self = this
        ptc = self.tiledPreviewCanvas
        ptc.ctx.clearRect 0, 0, ptc.width, ptc.height
      
      _highlightFocusedCells: ->
        self = this
        ctx = self.workingCanvas.ctx
        isDragging = self.workingCanvas.$element.mouseTracker("isDragging")
        if self.focusedCells and not (isDragging or SpriteEditor.Keyboard.pressedKeys[SpriteEditor.Keyboard.CTRL_KEY]) and self.app.currentToolName == "pencil"
          currentColor = self.app.currentColor[self.app.currentColor.type]
          ctx.save()
          $.v.each self.focusedCells, (cell) ->
            self.drawWorkingCell cell, color: "#fff"
            self.drawWorkingCell cell, color: currentColor["with"](alpha: 0.5)
          
          ctx.restore()
      
      _fillCells: ->
        self = this
        wc = self.workingCanvas
        pc = self.previewCanvas
        wc.ctx.save()
        $.v.each self.cells, (row, i) ->
          $.v.each row, (origCell, j) ->
            customCell = self.app.currentTool().trigger("cellToDraw", origCell)
            self.drawCell customCell or origCell
        
        wc.ctx.restore()
        pc.ctx.putImageData pc.imageData, 0, 0
      
      _updateTiledPreviewCanvas: ->
        self = this
        tpc = self.tiledPreviewCanvas
        pattern = tpc.ctx.createPattern(self.previewCanvas.element, "repeat")
        tpc.ctx.save()
        tpc.ctx.fillStyle = pattern
        tpc.ctx.fillRect 0, 0, tpc.width, tpc.height
        tpc.ctx.restore()
    
    canvases
  )()
  $.export "SpriteEditor.DrawingCanvases", DrawingCanvases
) window, window.document, window.ender
