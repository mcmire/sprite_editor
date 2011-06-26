$.export "SpriteEditor.Box.Colors", (SpriteEditor) ->

  Keyboard = SpriteEditor.Keyboard
  Color    = SpriteEditor.Color

  Colors = {}
  SpriteEditor.DOMEventHelpers.mixin(Colors, "SpriteEditor_Box_Colors")

  $.extend Colors,
    name: "Colors"
    header: "Colors"

    colorTypes: ["foreground", "background"]

    init: (app) ->
      SpriteEditor.Box.init.call(this, app)

      @colorSampleDivs = {}
      for type in @colorTypes
        ((self, type) ->
          $div = $('<div class="color_sample" />')
          $div.bind
            click:  -> self.app.colorPicker.open(self.currentColors[type], type)
            render: -> $div.css "background-color", self.currentColors[type].toRGBAString()
          self.$element.append($div)
          self.colorSampleDivs[type] = $div
        )(this, type)

      @reset()

      $div.trigger("render") for type, $div of @colorSampleDivs

      return this

    destroy: ->
      SpriteEditor.Box.destroy.call(this)
      @colorSampleDivs = {}
      @currentColorType = null
      @currentColors = {}
      @removeEvents()
      return this

    reset: ->
      @currentColorType = "foreground"
      # TODO: Assuming fg and bg colors were previously saved in a cookie,
      # we should pull from the cookie here
      @currentColors = {
        foreground: new Color(red: 172, green: 85, blue: 255)
        background: new Color(red: 255, green: 38, blue: 192)
      }
      @_selectColorType(@currentColorType)

    addEvents: ->
      @_bindEvents document,
        keydown: (event) =>
          key = event.keyCode
          switch key
            when Keyboard.X_KEY
              @_switchForegroundAndBackgroundColor()
            when Keyboard.SHIFT_KEY
              @_selectColorType("background")
        keyup: (event) =>
          @_selectColorType("foreground")

    removeEvents: ->
      @_unbindEvents(document, "keydown", "keyup")

    update: (color) ->
      @currentColors[@currentColorType] = color
      @colorSampleDivs[@currentColorType].trigger("render")

    currentColor: ->
      @currentColors[@currentColorType]

    _selectColorType: (colorType) ->
      @colorSampleDivs[@currentColorType].removeClass("selected")
      @currentColorType = colorType
      @colorSampleDivs[colorType].addClass("selected")

    _switchForegroundAndBackgroundColor: ->
      tmp = @currentColors.foreground
      @currentColors.foreground = @currentColors.background
      @currentColors.background = tmp
      @colorSampleDivs.foreground.trigger("render")
      @colorSampleDivs.background.trigger("render")

  return Colors