((window, document, $, undefined_) ->
  Tools = 
    toolNames: [ "pencil", "bucket", "select", "dropper" ]
    init: (app, canvases) ->
      self = this
      $.v.each self.toolNames, (name) ->
        self[name].init app, canvases
      
      self
  
  Tools.base = $.extend({}, SpriteEditor.Eventable, 
    init: (app, canvases) ->
      self = this
      self.app = app
      self.canvases = canvases
    
    trigger: ->
      self = this
      args = Array::slice.call(arguments)
      name = args.shift()
      self[name].apply self, args  unless typeof self[name] == "undefined"
  )
  Tools.dropper = (->
    t = $.extend(true, {}, Tools.base)
    $.extend t, 
      select: ->
        self = this
        self.canvases.workingCanvas.$element.addClass "dropper"
      
      unselect: ->
        self = this
        self.canvases.workingCanvas.$element.removeClass "dropper"
      
      mousedown: (event) ->
        self = this
        app = self.app
        color = self.canvases.focusedCell.color
        app.currentColor[app.currentColor.type] = color.clone()
        app.colorSampleDivs[app.currentColor.type].trigger "update"
    
    t
  )()
  Tools.pencil = (->
    t = $.extend(true, {}, Tools.base)
    $.extend t, actionableCells: {}
    t.addAction "updateCells", 
      do: ->
        event = canvases: {}
        changedCells = []
        $.v.each t.actionableCells, (coords, after) ->
          before = t.canvases.cells[after.loc.i][after.loc.j]
          t.canvases.cells[after.loc.i][after.loc.j] = after
          changedCells.push 
            before: before
            after: after
        
        event.canvases.changedCells = changedCells
        event
      
      undo: (event) ->
        $.v.each event.canvases.changedCells, (cell) ->
          t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before
      
      redo: (event) ->
        $.v.each event.canvases.changedCells, (cell) ->
          t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after
    
    $.extend t, 
      mousedown: (event) ->
        self = this
        self.actionableCells = {}
        self.mousedrag event
      
      mousedrag: (event) ->
        self = this
        erase = (event.rightClick or SpriteEditor.Keyboard.pressedKeys[SpriteEditor.Keyboard.CTRL_KEY])
        currentColor = t.app.currentColor[t.app.currentColor.type]
        $.v.each t.canvases.focusedCells, (cell) ->
          return  if cell.coords() of self.actionableCells
          cell = (if erase then cell.asClear() else cell.withColor(currentColor))
          self.actionableCells[cell.coords()] = cell
      
      mouseup: (event) ->
        self = this
        self.recordEvent "updateCells"
        self.actionableCells = {}
      
      cellToDraw: (cell) ->
        self = this
        if cell.coords() of self.actionableCells
          self.actionableCells[cell.coords()]
        else
          cell
    
    t
  )()
  Tools.bucket = (->
    t = $.extend(true, {}, Tools.base)
    t.addAction "fillFocusedCells", 
      do: ->
        event = canvases: {}
        currentColor = t.app.currentColor[t.app.currentColor.type]
        focusedColor = t.canvases.focusedCells[0].color.clone()
        changedCells = []
        $.v.each t.canvases.cells, (row, i) ->
          $.v.each row, (cell, j) ->
            if cell.color.eq(focusedColor)
              before = cell
              after = cell.withColor(currentColor)
              row[j] = after
              changedCells.push 
                before: before
                after: after
        
        event.canvases.changedCells = changedCells
        event
      
      undo: (event) ->
        $.v.each event.canvases.changedCells, (cell) ->
          t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before
      
      redo: (event) ->
        $.v.each event.canvases.changedCells, (cell) ->
          t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after
    
    t.addAction "clearFocusedCells", 
      do: ->
        event = canvases: {}
        focusedColor = t.canvases.focusedCells[0].color.clone()
        changedCells = []
        $.v.each t.canvases.cells, (row, i) ->
          $.v.each row, (cell, j) ->
            if cell.color.eq(focusedColor)
              before = cell
              after = cell.asClear()
              row[j] = after
              changedCells.push 
                before: before
                after: after
        
        event.canvases.changedCells = changedCells
        event
      
      undo: (event) ->
        $.v.each event.canvases.changedCells, (cell) ->
          t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before
      
      redo: (event) ->
        $.v.each event.canvases.changedCells, (cell) ->
          t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after
    
    $.extend t, 
      mousedown: (event) ->
        self = this
        if event.rightClick or SpriteEditor.Keyboard.pressedKeys[SpriteEditor.Keyboard.CTRL_KEY]
          self._setCellsLikeCurrentToUnfilled()
        else
          self._setCellsLikeCurrentToFilled()
      
      draw: ->
      
      _setCellsLikeCurrentToFilled: ->
        self = this
        self.recordEvent "fillFocusedCells"
      
      _setCellsLikeCurrentToUnfilled: ->
        self = this
        self.recordEvent "clearFocusedCells"
    
    t
  )()
  Tools.select = (->
    t = $.extend(true, {}, Tools.base)
    $.extend t, 
      selectionStart: null
      selectionEnd: null
      selectedCells: []
      makingSelection: false
      animOffset: 0
      animateSelectionBox: false
    
    t.addAction "cutSelection", 
      do: (event) ->
        event = 
          me: 
            selectionStart: {}
            selectionEnd: {}
          
          canvases: {}
        
        t.canvases.clipboard = $.v.map(t.selectedCells, (cell) ->
          cell.clone()
        )
        changedCells = []
        $.v.each t.selectedCells, (cell) ->
          before = t.canvases.cells[cell.loc.i][cell.loc.j]
          after = before.asClear()
          t.canvases.cells[cell.loc.i][cell.loc.j] = after
          changedCells.push 
            before: before
            after: after
        
        event.canvases.changedCells = changedCells
        event.me.selectionStart.before = t.selectionStart
        event.me.selectionEnd.before = t.selectionEnd
        t.reset()
        event
      
      undo: (event) ->
        $.v.each event.canvases.changedCells, (cell) ->
          t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before
        
        t.selectionStart = event.before.me.selectionStart
        t.selectionEnd = event.before.me.selectionEnd
        t.calculateSelectedCells()
      
      redo: (after) ->
        $.v.each event.canvases.changedCells, (cell) ->
          t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after
        
        t.reset()
    
    t.addAction "moveSelection", 
      do: ->
        event = 
          me: 
            selectionStart: {}
            selectionEnd: {}
          
          canvases: {}
        
        changedCells = []
        $.v.each t.selectedCells, (srcBefore) ->
          tgtLoc = srcBefore.loc.plus(t.dragOffset)
          tgtBefore = t.canvases.cells[tgtLoc.i][tgtLoc.j]
          tgtAfter = tgtBefore.withColor(srcBefore.color)
          t.canvases.cells[tgtLoc.i][tgtLoc.j] = tgtAfter
          changedCells.push 
            before: tgtBefore
            after: tgtAfter
          
          srcAfter = srcBefore.asClear()
          t.canvases.cells[srcBefore.loc.i][srcBefore.loc.j] = srcAfter
          changedCells.push 
            before: srcBefore
            after: srcAfter
        
        event.canvases.changedCells = changedCells
        event.me.selectionStart.before = t.selectionStart
        event.me.selectionStart.after = t.selectionStart = t.selectionStart.plus(t.dragOffset)
        event.me.selectionEnd.before = t.selectionEnd
        event.me.selectionEnd.after = t.selectionEnd = t.selectionEnd.plus(t.dragOffset)
        t.calculateSelectedCells()
        t.dragOffset = null
        event
      
      undo: (event) ->
        $.v.each event.canvases.changedCells, (cell) ->
          t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before
        
        t.selectionStart = event.me.selectionStart.before
        t.selectionEnd = event.me.selectionEnd.before
        t.calculateSelectedCells()
      
      redo: (event) ->
        $.v.each event.canvases.changedCells, (cell) ->
          t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after
        
        t.selectionStart = event.me.selectionStart.after
        t.selectionEnd = event.me.selectionEnd.after
        t.calculateSelectedCells()
    
    t.addAction "resetSelection", 
      do: (event) ->
        event = me: 
          selectionStart: {}
          selectionEnd: {}
        
        event.me.selectionStart.before = t.selectionStart
        event.me.selectionEnd.before = t.selectionEnd
        t.reset()
        event
      
      undo: (event) ->
        t.selectionStart = event.me.selectionStart.before
        t.selectionEnd = event.me.selectionEnd.before
      
      redo: (event) ->
        t.reset()
    
    $.extend t, 
      reset: ->
        self = this
        self.selectionStart = null
        self.selectionEnd = null
        self.selectedCells = []
        self.makingSelection = false
      
      calculateSelectedCells: ->
        self = this
        selectedCells = []
        i = self.selectionStart.i
        
        while i <= self.selectionEnd.i
          j = self.selectionStart.j
          
          while j <= self.selectionEnd.j
            selectedCells.push self.canvases.cells[i][j].clone()
            j++
          i++
        self.selectedCells = selectedCells
      
      select: ->
        self = this
        self.canvases.workingCanvas.$element.addClass "crosshair"
      
      unselect: ->
        self = this
        self.canvases.workingCanvas.$element.removeClass "crosshair"
        self._exitSelection()
      
      keydown: (event) ->
        self = this
        key = event.keyCode
        self._cutSelection()  if key == SpriteEditor.Keyboard.X_KEY and (event.metaKey or event.ctrlKey)
      
      mouseglide: (event) ->
        self = this
        if self._focusIsInsideOfSelection()
          self.canvases.workingCanvas.$element.addClass "move"
        else
          self.canvases.workingCanvas.$element.removeClass "move"
      
      mousedragstart: (event) ->
        self = this
        if self.selectionStart and self._focusIsInsideOfSelection()
          $.v.each self.selectedCells, (cell) ->
            self.canvases.cells[cell.loc.i][cell.loc.j].clear()
        else
          self._exitSelection()
          self.makingSelection = true
          c = self.canvases.focusedCell
          self.selectionStart = c.loc.clone()
        self.animateSelectionBox = false
      
      mousedrag: (event) ->
        self = this
        if self.makingSelection
          self.selectionEnd = self.canvases.focusedCell.loc.clone()
        else
          self.dragOffset = SpriteEditor.CellLocation.subtract(self.canvases.focusedCell.loc, self.canvases.startDragAtCell.loc)
      
      mousedragstop: (event) ->
        self = this
        if self.makingSelection
          self.calculateSelectedCells()
        else
          self._moveSelection()
          self.dragOffset = null
        self.makingSelection = false
        self.animateSelectionBox = true
      
      mouseup: (event) ->
        self = this
        isDragging = self.canvases.workingCanvas.$element.mouseTracker("isDragging")
        self._exitSelection()  if not isDragging and self.selectionStart and self._focusIsOutsideOfSelection()
      
      draw: ->
        self = this
        return  if not self.selectionStart or not self.selectionEnd
        ctx = self.canvases.workingCanvas.ctx
        ctx.save()
        if self.dragOffset
          $.v.each self.selectedCells, (cell) ->
            loc = SpriteEditor.CellLocation.add(cell.loc, self.dragOffset)
            self.canvases.drawCell cell, loc: loc
        else
          $.v.each self.selectedCells, (cell) ->
            self.canvases.drawCell cell
        bounds = self._selectionBounds(self.dragOffset)
        ctx.strokeStyle = "#000"
        ctx.beginPath()
        x = bounds.x1 + self.animOffset
        
        while x < bounds.x2
          y1 = bounds.y1
          ctx.moveTo x, y1 + 0.5
          ctx.lineTo x + 2, y1 + 0.5
          x += 4
        y = bounds.y1 + self.animOffset
        
        while y < bounds.y2
          x2 = bounds.x2
          ctx.moveTo x2 + 0.5, y
          ctx.lineTo x2 + 0.5, y + 2
          y += 4
        x = bounds.x2 - self.animOffset
        
        while x > bounds.x1 + 2
          y2 = bounds.y2
          ctx.moveTo x, y2 + 0.5
          ctx.lineTo x - 2, y2 + 0.5
          x -= 4
        y = bounds.y2 - self.animOffset
        
        while y > bounds.y1 + 2
          x1 = bounds.x1
          ctx.moveTo x1 + 0.5, y
          ctx.lineTo x1 + 0.5, y - 2
          y -= 4
        ctx.stroke()
        ctx.restore()
        if self.animateSelectionBox
          self.animOffset++
          self.animOffset %= 4
      
      _selectionBounds: (offset) ->
        self = this
        ss = self.selectionStart
        se = self.selectionEnd
        bounds = {}
        if ss.i > se.i
          bounds.y1 = se.y
          bounds.y2 = ss.y
        else
          bounds.y1 = ss.y
          bounds.y2 = se.y
        if ss.j > se.j
          bounds.x1 = se.x
          bounds.x2 = ss.x
        else
          bounds.x1 = ss.x
          bounds.x2 = se.x
        if offset
          bounds.x1 += offset.x
          bounds.x2 += offset.x
          bounds.y1 += offset.y
          bounds.y2 += offset.y
        bounds.x2 += self.canvases.cellSize
        bounds.y2 += self.canvases.cellSize
        bounds
      
      _focusIsInsideOfSelection: ->
        self = this
        c = self.canvases.focusedCell
        sa = self.selectionStart
        sb = self.selectionEnd
        sa and sb and c.loc.i >= sa.i and c.loc.i <= sb.i and c.loc.j >= sa.j and c.loc.j <= sb.j
      
      _focusIsOutsideOfSelection: ->
        self = this
        c = self.canvases.focusedCell
        sa = self.selectionStart
        sb = self.selectionEnd
        c.loc.i < sa.i or c.loc.i > sb.i or c.loc.j < sa.j or c.loc.j > sb.j
      
      _cutSelection: ->
        self = this
        self.recordEvent "cutSelection"
      
      _moveSelection: (dragOffset) ->
        self = this
        self.recordEvent "moveSelection"
      
      _exitSelection: ->
        self = this
        self.recordEvent "resetSelection"  if self.selectionStart
    
    t
  )()
  $.export "SpriteEditor.Tools", Tools
) window, window.document, window.ender
