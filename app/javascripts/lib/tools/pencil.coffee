{Keyboard, Toolset} = SpriteEditor

Toolset.addTool "pencil", "E", (t) ->
  t.addAction "updateCells",
    do: ->
      event = {canvases: {}}

      changedCells = []
      $.v.each t.upcomingCells, (coords, after) ->
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
    reset: ->
      @upcomingCells = {}

    mousedown: (event) ->
      @reset()
      @mousedrag(event)

    mousedrag: (event) ->
      # FIXME: If you drag too fast it will skip some cells!
      # Use the current mouse position and the last mouse position and
      #  fill in or erase cells in between.
      erase = (event.rightClick or Keyboard.isKeyPressed(Keyboard.CTRL_KEY))
      currentColor = (if erase then null else @app.boxes.colors.currentColor())
      for coords, cell of @canvases.focusedCells
        continue if cell.coords() of @upcomingCells
        # Copy the cell so that if its color changes in the future, it won't
        # cause all cells with that color to also change
        cell = (if erase then cell.asClear() else cell.withColor(currentColor))
        @upcomingCells[cell.coords()] = cell

    mouseup: (event) ->
      @recordEvent("updateCells")
      @reset()

    cellOptions: (cell) ->
      opts = {}
      upcomingCell = @upcomingCells[cell.coords()]
      focusedCell = @canvases.focusedCells?[cell.coords()]

      # Fill in cells over which the user is dragging (as they haven't been
      # stored in canvases.cells yet).
      if upcomingCell
        opts.color = upcomingCell.color

      # Or, highlight the currently focused cells by filling them in with a
      # lighter version of the current color. If Ctrl is being held down,
      # fill them in with a lighter version of the cells themselves.
      else if focusedCell
        if Keyboard.isKeyPressed(Keyboard.CTRL_KEY)
          opts.color = cell.color.with(alpha: 0.2)
        else
          currentColor = @app.boxes.colors.currentColor()
          opts.color = currentColor.with(alpha: 0.5)

      return opts
