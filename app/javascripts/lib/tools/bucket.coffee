{Keyboard, Toolset} = SpriteEditor

Toolset.addTool "bucket", "G", (t) ->
  t.addAction "fillFocusedCells",
    do: ->
      event = canvases: {}

      currentColor = t.app.boxes.colors.currentColor()
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