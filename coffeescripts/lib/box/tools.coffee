$.export "SpriteEditor.Box.Tools", (SpriteEditor) ->

  Keyboard = SpriteEditor.Keyboard

  Tools = {}
  SpriteEditor.DOMEventHelpers.mixin(Tools, "SpriteEditor_Box_Tools")

  $.extend Tools,
    name: "Tools"
    header: "Toolbox"

    currentToolName: null

    init: (app) ->
      SpriteEditor.Box.init.call(this, app)

      $ul = $("<ul/>")
      @$element.append($ul)

      @toolImages = {}
      for name in @app.tools.toolNames
        ((self, name) ->
          $li = $("<li/>")
          $img = $("<img/>")
          $img.addClass("tool")
            .attr("width", 24)
            .attr("height", 24)
            .attr("src", "images/#{name}.png")
          self.toolImages[name] = $img
          $li.append($img)
          $ul.append($li)
          $img.bind "click", -> self.select(name)
        )(this, name)

      @select(@app.tools.toolNames[0])

      return this

    addEvents: ->
      @_bindEvents document,
        keydown: (event) =>
          key = event.keyCode
          switch key
            when Keyboard.E_KEY
              @select("pencil")
            when Keyboard.G_KEY
              @select("bucket")
            when Keyboard.S_KEY
              @select("select")
            when Keyboard.Q_KEY
              @select("dropper")

    removeEvents: ->
      @_unbindEvents(document, "keydown")

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

  return Tools