$.export "SpriteEditor.Tools", (SpriteEditor) ->

  Keyboard = SpriteEditor.Keyboard

  Tools =
    toolNames: [ "pencil", "bucket", "select", "dropper" ]

    init: (app, canvases) ->
      for name in @toolNames
        @[name].init(app, canvases)
      return this

  #-----------------------------------------------------------------------------

  Tools.base = $.extend {}, SpriteEditor.Eventable,
    init: (app, canvases) ->
      @app = app
      @canvases = canvases

    trigger: (name, args...) ->
      @[name]?.apply(this, args)

  #-----------------------------------------------------------------------------

  Tools.dropper = $.extend true, {}, Tools.base,
    select: ->
      @canvases.workingCanvas.$element.addClass("dropper")

    unselect: ->
      @canvases.workingCanvas.$element.removeClass("dropper")

    mousedown: (event) ->
      app = @app
      color = @canvases.focusedCell.color
      app.currentColor[app.currentColor.type] = color.clone()
      app.colorSampleDivs[app.currentColor.type].trigger("update")

  #-----------------------------------------------------------------------------

  Tools.pencil = $.tap $.extend(true, {}, Tools.base), (t) ->
    t.addAction "updateCells",
      do: ->
        event = canvases: {}

        changedCells = []
        for coords, after of t.actionableCells
          do (after) ->
            before = t.canvases.cells[after.loc.i][after.loc.j]
            t.canvases.cells[after.loc.i][after.loc.j] = after
            changedCells.push(before: before, after: after)
        event.canvases.changedCells = changedCells

        return event

      undo: (event) ->
        for cell in event.canvases.changedCells
          t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before

      redo: (event) ->
        for cell in event.canvases.changedCells
          t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after

    $.extend t,
      actionableCells: {}

      mousedown: (event) ->
        @actionableCells = {}
        @mousedrag(event)

      mousedrag: (event) ->
        self = this
        # FIXME: If you drag too fast it will skip some cells!
        # Use the current mouse position and the last mouse position and
        #  fill in or erase cells in between.
        erase = (event.rightClick or Keyboard.pressedKeys[Keyboard.CTRL_KEY])
        currentColor = t.app.currentColor[t.app.currentColor.type]
        for cell in t.canvases.focusedCells
          continue if cell.coords() of @actionableCells
          # Copy the cell so that if its color changes in the future, it won't
          # cause all cells with that color to also change
          cell = (if erase then cell.asClear() else cell.withColor(currentColor))
          @actionableCells[cell.coords()] = cell

      mouseup: (event) ->
        @recordEvent("updateCells")
        @actionableCells = {}

      cellToDraw: (cell) ->
        if cell.coords() of @actionableCells
          @actionableCells[cell.coords()]
        else
          cell

  #-----------------------------------------------------------------------------

  Tools.bucket = $.tap $.extend(true, {}, Tools.base), (t) ->
    t.addAction "fillFocusedCells",
      do: ->
        event = canvases: {}

        currentColor = t.app.currentColor[t.app.currentColor.type]
        focusedColor = t.canvases.focusedCells[0].color.clone()

        # Look for all cells with the color of the current cell (or look for all
        # empty cells, if the current cell is empty) and mark them as filled
        # with the current color
        changedCells = []
        $.v.each t.canvases.cells, (row) ->
          $.v.each row, (cell, j) ->
            if cell.color.eq(focusedColor)
              before = cell
              after = cell.withColor(currentColor)
              row[j] = after
              changedCells.push(before: before, after: after)
        event.canvases.changedCells = changedCells

        return event

      undo: (event) ->
        for cell in event.canvases.changedCells
          t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before

      redo: (event) ->
        for cell in event.canvases.changedCells
          t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after

    t.addAction "clearFocusedCells",
      do: ->
        event = canvases: {}

        # Copy this as the color of the current cell will change during this loop
        focusedColor = t.canvases.focusedCells[0].color.clone()

        # Look for all cells with the color of the current cell
        # and mark them as unfilled
        changedCells = []
        $.v.each t.canvases.cells, (row) ->
          $.v.each row, (cell, j) ->
            if cell.color.eq(focusedColor)
              before = cell
              after = cell.asClear()
              row[j] = after
              changedCells.push(before: before, after: after)
        event.canvases.changedCells = changedCells

        return event

        undo: (event) ->
          for cell in event.canvases.changedCells
            t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before

        redo: (event) ->
          for cell in event.canvases.changedCells
            t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after

    $.extend t,
      mousedown: (event) ->
        if event.rightClick or Keyboard.pressedKeys[Keyboard.CTRL_KEY]
          @_setCellsLikeCurrentToUnfilled()
        else
          @_setCellsLikeCurrentToFilled()

      draw: ->
        # ...

      _setCellsLikeCurrentToFilled: ->
        @recordEvent("fillFocusedCells")

      _setCellsLikeCurrentToUnfilled: ->
        @recordEvent("clearFocusedCells")

  #-----------------------------------------------------------------------------

  Tools.select = $.tap $.extend(true, {}, Tools.base), (t) ->
    t.addAction "cutSelection",
      do: (event) ->
        event =
          me: {selectionStart: {}, selectionEnd: {}}
          canvases: {}

        # Put the selected cells on the clipboard
        t.canvases.clipboard = $.v.map(t.selectedCells, (cell) ->
          cell.clone()
        )
        # Clear the cells
        changedCells = []
        for cell in t.selectedCells
          before = t.canvases.cells[cell.loc.i][cell.loc.j]
          after = before.asClear()
          t.canvases.cells[cell.loc.i][cell.loc.j] = after
          changedCells.push(before: before, after: after)
        event.canvases.changedCells = changedCells

        # Hide the selection box
        event.me.selectionStart.before = t.selectionStart
        event.me.selectionEnd.before = t.selectionEnd

        t.reset()

        return event

      undo: (event) ->
        # Restore the cleared cells
        for cell in event.canvases.changedCells
          t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before
        # Restore the selection box
        t.selectionStart = event.before.me.selectionStart
        t.selectionEnd = event.before.me.selectionEnd
        t.calculateSelectedCells()

      redo: (after) ->
        # Re-clear the cleared cells
        for cell in event.canvases.changedCells
          t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after
        # Re-hide the selection box
        t.reset()

    t.addAction "moveSelection",
      do: ->
        event =
          me: {selectionStart: {}, selectionEnd: {}}
          canvases: {}

        # Move the cells that the currently selected cells point to

        # Separate the source and target cells so on undo/redo we can control
        # which type of cells get drawn first. There *is* a difference in order:
        # on undo, we want to draw target first, then source, whereas on redo,
        # we want source first, then target. This is to prevent clear cells
        # from overwriting non-clear cells unintentionally.
        #
        changedCells = {src: [], tgt: []}

        for srcBefore in t.selectedCells
          # Make a clear version of the source cell
          srcAfter = srcBefore.asClear()
          # Use the dragOffset to find the target cell
          tgtLoc = srcBefore.loc.plus(t.dragOffset)
          tgtBefore = t.canvases.cells[tgtLoc.i][tgtLoc.j]
          tgtAfter = tgtBefore.withColor(srcBefore.color)

          # Replace the target cell with a copy of the source cell
          # (We've already cleared the source cell internally, as that happened
          # as soon as the selection started being moved.)
          t.canvases.cells[tgtLoc.i][tgtLoc.j] = tgtAfter

          # Record the change
          changedCells.src.push(before: srcBefore, after: srcAfter)
          changedCells.tgt.push(before: tgtBefore, after: tgtAfter)

        event.canvases.changedCells = changedCells

        # Move the selection box
        # We don't offset the selectedCells themselves since we can recalculate them
        event.me.selectionStart.before = t.selectionStart
        event.me.selectionStart.after = t.selectionStart = t.selectionStart.plus(t.dragOffset)
        event.me.selectionEnd.before = t.selectionEnd
        event.me.selectionEnd.after = t.selectionEnd = t.selectionEnd.plus(t.dragOffset)
        t.calculateSelectedCells()
        #console.log "Selected cells:"
        #console.log cell.inspect() for cell in t.selectedCells

        # XXX: Does this belong here?
        t.dragOffset = null

        return event

      undo: (event) ->
        # Move the target cells to the source cells
        for cell in event.canvases.changedCells.tgt
          t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before
        for cell in event.canvases.changedCells.src
          t.canvases.cells[cell.before.loc.i][cell.before.loc.j] = cell.before

        # Move the selection box back
        t.selectionStart = event.me.selectionStart.before
        t.selectionEnd = event.me.selectionEnd.before
        t.calculateSelectedCells()
        #console.log "Selected cells:"
        #console.log cell.inspect() for cell in t.selectedCells

      redo: (event) ->
        # Move the source cells back to the target cells
        for cell in event.canvases.changedCells.src
          t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after
        for cell in event.canvases.changedCells.tgt
          t.canvases.cells[cell.after.loc.i][cell.after.loc.j] = cell.after

        # Move the selection box back
        t.selectionStart = event.me.selectionStart.after
        t.selectionEnd = event.me.selectionEnd.after
        t.calculateSelectedCells()
        #console.log "Selected cells:"
        #console.log cell.inspect() for cell in t.selectedCells

    t.addAction "resetSelection",
      do: (event) ->
        event =
          me: {selectionStart: {}, selectionEnd: {}}

        # Hide the selection box
        event.me.selectionStart.before = t.selectionStart
        event.me.selectionEnd.before = t.selectionEnd
        t.reset()

        return event

      undo: (event) ->
        # Restore the selection box
        t.selectionStart = event.me.selectionStart.before
        t.selectionEnd = event.me.selectionEnd.before

      redo: (event) ->
        # Re-hide the selection box
        t.reset()

    $.extend t,
      selectionStart: null
      selectionEnd: null
      selectionStartBeforeDrag: null
      selectionEndBeforeDrag: null
      selectedCells: []
      makingSelection: false
      animOffset: 0
      animateSelectionBox: false

      reset: ->
        # Clear the selection box and reset other involved variables
        @selectionStart = null
        @selectionEnd = null
        @selectionStartBeforeDrag = null
        @selectionEndBeforeDrag = null
        @selectedCells = []
        @makingSelection = false

      calculateSelectedCells: ->
        selectedCells = []
        i = @selectionStart.i
        while i <= @selectionEnd.i
          j = @selectionStart.j
          while j <= @selectionEnd.j
            selectedCells.push @canvases.cells[i][j].clone()
            j++
          i++
        @selectedCells = selectedCells

      select: ->
        @canvases.workingCanvas.$element.addClass("crosshair")

      unselect: ->
        @canvases.workingCanvas.$element.removeClass("crosshair")
        @canvases.workingCanvas.$element.removeClass("move")
        @_exitSelection()

      keydown: (event) ->
        key = event.keyCode
        if key == Keyboard.X_KEY and (event.metaKey or event.ctrlKey)
          # Ctrl-X: Cut selection
          @_cutSelection()

      mouseglide: (event) ->
        if @_focusIsInsideOfSelection()
          @canvases.workingCanvas.$element.addClass("move")
        else
          @canvases.workingCanvas.$element.removeClass("move")

      mousedragstart: (event) ->
        # If something is selected and drag started from within the selection,
        # then detach the selected cells from the canvas and put them in a
        # separate selection layer
        #---
        # FIXME: This actually removes the corresponding pixels from the preview
        # canvas. Our cells array should have a concept of layers -- and so then
        # to render the preview canvas we just flatten the layers
        if @selectionStart and @_focusIsInsideOfSelection()
          for cell in @selectedCells
            @canvases.cells[cell.loc.i][cell.loc.j].clear()
          @selectionStartBeforeDrag = @selectionStart.clone()
          @selectionEndBeforeDrag = @selectionEnd.clone()
        # Otherwise, the user is making a new selection
        else
          @_exitSelection()
          @makingSelection = true
          @selectionStart = @canvases.focusedCell.loc.clone()
        @animateSelectionBox = false

      mousedrag: (event) ->
        if @makingSelection
          # Expand or contract the selection box based on the location of the cell that has focus
          @selectionEnd = @canvases.focusedCell.loc.clone()
        else
          # Record the amount the selection box has been dragged.
          # While the box is being dragged, the selected cells have virtual
          # positions, and so the drag offset affects where the cells are drawn
          # until the drag stops, at which point the virtual positions become
          # real positions.
          @dragOffset = SpriteEditor.CellLocation.subtract(
            @canvases.focusedCell.loc,
            @canvases.startDragAtCell.loc
          )

      mousedragstop: (event) ->
        if @makingSelection
          @calculateSelectedCells()
        else
          @_moveSelection()
          @dragOffset = null
          @selectionStartBeforeDrag = null
          @selectionEndBeforeDrag = null
        @makingSelection = false
        @animateSelectionBox = true

      mouseup: (event) ->
        # If mouse is clicked out of the selection, merge the selection layer
        # into the canvas and then clear the selection
        isDragging = @canvases.workingCanvas.$element.mouseTracker("isDragging")
        if not isDragging and @selectionStart and @_focusIsOutsideOfSelection()
          @_exitSelection()

      draw: ->
        if @selectionStart and @selectionEnd
          @_drawSelectionBox(
            start: @selectionStart,
            end: @selectionEnd,
            offset: @dragOffset,
            animate: @animateSelectionBox
          )

        if @selectionStartBeforeDrag and @selectionEndBeforeDrag
          @_drawSelectionBox(
            start: @selectionStartBeforeDrag,
            end: @selectionEndBeforeDrag,
            animate: false,
            shadow: true
          )

      _drawSelectionBox: (args) ->
        alpha = (if args.shadow then 0.3 else 1)

        ctx = @canvases.workingCanvas.ctx
        ctx.save()

        # Draw the selected cells, which is actually a separate layer, since
        # they may have been dragged to a different place than the actual
        # cells they originally point to
        if args.offset
          for cell in @selectedCells
            loc = SpriteEditor.CellLocation.add(cell.loc, args.offset)
            @canvases.drawCell(cell, loc: loc)
        else
          for cell in @selectedCells
            @canvases.drawCell(cell, color: cell.color.with(alpha: alpha))

        bounds = @_selectionBounds(args)

        # Draw a rectangle that represents the selection area, with an animated
        # "marching ants" dotted border
        ctx.strokeStyle = "rgba(0, 0, 0, #{alpha})"
        ctx.beginPath()
        # top
        for x in [ bounds.x1 + @animOffset .. bounds.x2 ] by 4
          y1 = bounds.y1
          ctx.moveTo(x, y1 + 0.5)
          ctx.lineTo(x + 2, y1 + 0.5)
        # right
        for y in [ bounds.y1 + @animOffset .. bounds.y2 ] by 4
          x2 = bounds.x2
          ctx.moveTo(x2 + 0.5, y)
          ctx.lineTo(x2 + 0.5, y + 2)
        # bottom
        for x in [ bounds.x2 - @animOffset .. bounds.x1 + 2 ] by -4
          y2 = bounds.y2
          ctx.moveTo(x, y2 + 0.5)
          ctx.lineTo(x - 2, y2 + 0.5)
        # left
        for y in [ bounds.y2 - @animOffset .. bounds.y1 + 2 ] by -4
          x1 = bounds.x1
          ctx.moveTo(x1 + 0.5, y)
          ctx.lineTo(x1 + 0.5, y - 2)
        ctx.stroke()

        ctx.restore()

        if args.animate
          # Animate the "marching ants"
          @animOffset++
          @animOffset %= 4

      _selectionBounds: (args) ->
        [ss, se] = [args.start, args.end]
        bounds = {}
        # Ensure that x2 > x1 and y2 > y1, as the following could happen if the
        # selection box is created by the following motions:
        # - dragging from top-right to bottom-left: x1 > x2
        # - dragging from bottom-left to top-right: y1 > y2
        # - dragging from bottom-right to top-left: both x1 > x2 and y1 > y2
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
        if args.offset
          bounds.x1 += args.offset.x
          bounds.x2 += args.offset.x
          bounds.y1 += args.offset.y
          bounds.y2 += args.offset.y
        # Snap the bottom-right corner of the selection box to the bottom-right
        # corner of the bottom-right cell (got it?)
        bounds.x2 += @canvases.cellSize
        bounds.y2 += @canvases.cellSize
        bounds

      _focusIsInsideOfSelection: ->
        c = @canvases.focusedCell
        sa = @selectionStart
        sb = @selectionEnd
        return (
          sa && sb &&
          c.loc.i >= sa.i && c.loc.i <= sb.i &&
          c.loc.j >= sa.j && c.loc.j <= sb.j
        )

      _focusIsOutsideOfSelection: ->
        c = @canvases.focusedCell
        sa = @selectionStart
        sb = @selectionEnd
        return (
          c.loc.i < sa.i || c.loc.i > sb.i ||
          c.loc.j < sa.j || c.loc.j > sb.j
        )

      _cutSelection: ->
        @recordEvent("cutSelection")

      _moveSelection: (dragOffset) ->
        @recordEvent("moveSelection")

      _exitSelection: ->
        @recordEvent("resetSelection") if @selectionStart

  #-----------------------------------------------------------------------------

  return Tools