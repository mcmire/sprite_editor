$.export "SpriteEditor.Box.Tools", (SpriteEditor) ->

  Tools =
    name: "Tools"
    header: "Toolbox"
    currentToolName: null

    init: (app) ->
      self = this
      SpriteEditor.Box.init.call(this, app)

      $ul = $("<ul/>")
      @$element.append($ul)

      @toolImages = {}
      for name in @app.tools.toolNames
        do (self, name) ->
          $li = $("<li/>")
          $img = $("<img/>")
          $img.addClass("tool")
            .attr("width", 24)
            .attr("height", 24)
            .attr("src", "images/#{name}.png")
          @toolImages[name] = $img
          $li.append($img)
          $ul.append($li)
          $img.bind "click", -> self.select(name)

      @select(@app.tools.toolNames[0])

      return this

    currentTool: ->
      @app.tools[@currentToolName]

    select: (name) ->
      return if name is @currentToolName
      if @currentToolName
        @currentTool().unselect?()
        @toolImages[@currentToolName].removeClass("selected")
      @currentToolName = name
      @toolImages[name].addClass("selected")
      @app.tools[name].select?()