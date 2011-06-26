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

      @reset()

      return this

    destroy: ->
      SpriteEditor.Box.destroy.call(this)
      @toolImages = {}
      @currentToolName = null
      @removeEvents()

    reset: ->
      @select(@app.tools.toolNames[0])

    addEvents: ->
      self = this
      @_bindEvents document,
        keydown: (event) ->
          key = event.keyCode
          if name = self.app.tools.toolShortcuts[key]
            self.select(name)

    removeEvents: ->
      @_unbindEvents(document, "keydown")

    select: (name) ->
      return if name is @currentToolName
      if @currentToolName
        @currentTool().unselect?()
        @toolImages[@currentToolName].removeClass("selected")
      @currentToolName = name
      @toolImages[name].addClass("selected")
      @app.tools[name].select?()

    currentTool: ->
      @app.tools[@currentToolName]

  return Tools