$.export "SpriteEditor.Box.Colors", (SpriteEditor) ->

  Keyboard = SpriteEditor.Keyboard

  Colors = {}
  SpriteEditor.DOMEventHelpers.mixin(Colors, "SpriteEditor_Box_Colors")

  $.extend Colors,
    name: "Colors"
    header: "Colors"

    colorTypes: ["foreground", "background"]
    colorSampleDivs:
      foreground: null
      background: null
    currentColorType: "foreground"
    currentColors:
      # These are always stored in HSL!
      foreground: (new SpriteEditor.Color.RGB(172, 85, 255)).toHSL()
      background: (new SpriteEditor.Color.RGB(255, 38, 192)).toHSL()

    init: (app) ->
      SpriteEditor.Box.init.call(this, app)

      @colorSampleDivs = {}
      for type in @colorTypes
        ((self, type) ->
          $div = $('<div class="color_sample" />')
          $div.bind
            click: ->
              self.app.colorPicker.open(self.currentColors[type], type)
            render: ->
              $div.css "background-color", self.currentColors[type].toRGB().toString()
          $div.trigger("render")
          self.$element.append($div)
          self.colorSampleDivs[type] = $div
        )(this, type)

      @_selectColorType(@currentColorType)

      return this

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
      @_unbindEvents(document, "keydown")

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