{Keyboard, Toolset} = SpriteEditor

Toolset.addTool "dropper", "Q",
  select: ->
    @canvases.workingCanvas.$element.addClass("dropper")

  unselect: ->
    @canvases.workingCanvas.$element.removeClass("dropper")

  mousedown: (event) ->
    @app.boxes.colors.update @canvases.focusedCell.color.clone()