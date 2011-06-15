$.export "SpriteEditor.ColorPickerBox", do ->

  ColorPickerBox = {}
  SpriteEditor.DOMEventHelpers.mixin(ColorPickerBox, "SpriteEditor_ColorPickerBox")

  $.extend ColorPickerBox,
    hueSatCanvasSize: {width: 265, height: 300}
    lumCanvasSize: {width: 25, height: 300}
    # This is always stored in HSL!
    currentColor: (new SpriteEditor.Color.RGB(255, 0, 0)).toHSL()

    $container: null
    hueSatCanvas: null
    lumCanvas: null
    colorFields: {}

    init: (options) ->
      @options = options

      @$container = $('<div class="square_color_picker dialog" />').hide()

      @_addHueSatDiv()
      @_addLightnessDiv()
      @_addColorFields()
      @_addColorSample()
      @_addCloseButton()

      return this

    open: (color) ->
      @options.open?.call(this)

      @$container.show().center()

      @currentColor = color
      @_drawLightnessCanvas()
      @_setColorFields()
      @_positionHueSatSelectorFromColor()
      @_positionLightnessSelectorFromColor()
      @_setColorSample()

      @_addEvents()

    close: ->
      @$container.hide()
      @_removeEvents()
      @options?.close.call(this)

    _addHueSatDiv: ->
      $div = @$hueSatDiv = $('<div class="hue_sat_div" />')
      $div.css {
        width: @hueSatCanvasSize.width
        height: @hueSatCanvasSize.height
      }
      @$container.append($div)

      @_addHueSatCanvas()
      @_addHueSatSelectorDiv()

    _addHueSatCanvas: ->
      @hueSatCanvas = SpriteEditor.Canvas.create @hueSatCanvasSize.width, @hueSatCanvasSize.height, (c) ->
        imageData = c.ctx.createImageData(c.width, c.height)
        hsl = @currentColor
        # TODO: Use a gradient for this instead of manually filling in pixels
        for y in [0..c.height]
          for x in [0..c.width]
            # x = 0..width  -> h = 0..360
            # y = 0..height -> s = 100..0
            h = Math.round(x * (360 / c.width))
            s = Math.round(y * (-100 / c.height) + 100)
            rgb = hsl.with(hue: h, sat: s).toRGB()
            imageData.setPixel(x, y, rgb.red, rgb.green, rgb.blue, 255)
        c.ctx.putImageData(imageData, 0, 0)

      @hueSatCanvas.$element.addClass("hue_sat_canvas")
      @$hueSatDiv.append(@hueSatCanvas.$element)

    _addHueSatSelectorDiv: ->
      @$hueSatSelectorDiv = $('<div class="hue_sat_selector" />')
      @$hueSatDiv.append(@$hueSatSelectorDiv)

    _addLightnessDiv: ->
      @$lumDiv = $("<div class=\"lum_div\" />")
      @$lumDiv.css {
        width: @lumCanvasSize.width + 11
        height: @lumCanvasSize.height
      }
      @$container.append(@$lumDiv)

      @_addLightnessCanvas()

    _addLightnessCanvas: ->
      @lumCanvas = SpriteEditor.Canvas.create(@lumCanvasSize.width, @lumCanvasSize.height)
      @lumCanvas.$element.addClass("lum_canvas")
      @$lumDiv.append(@lumCanvas.$element)

    _drawLightnessCanvas: ->
      c = self.lumCanvas
      imageData = c.ctx.createImageData(c.width, c.height)
      hsl = self.currentColor
      # TODO: Use a gradient for this instead of manually filling in pixels
      for y in [0..c.height]
        # y = 0..height -> l = 100..0
        l = Math.round((-100 / c.height) * y + 100)
        rgb = hsl.with(lum: l).toRGB()
        for x in [0..c.width]
          imageData.setPixel(x, y, rgb.red, rgb.green, rgb.blue, 255)
      c.ctx.putImageData(imageData, 0, 0)

    _addColorFields: ->
      @$colorFieldsDiv = $('<div class="color_fields" />')
      for repName, rep of SpriteEditor.Color.componentsByRepresentation
        $repDiv = $('<div class="'+repName+'_fields" />')
        for cpt in rep
          $colorSpan = $('<span />')
          $colorField = $('<input type="text" size="3" />')
          @colorFields[cpt] = $colorField
          $colorSpan.html(cpt[0].toUpperCase() + ": ").append($colorField)
          $repDiv.append($colorSpan)
        @$colorFieldsDiv.append($repDiv)
      @$container.append(@$colorFieldsDiv)

    _addColorSample: ->
      @$colorSampleDiv = $('<div class="color_sample" />')
      @$container.append(@$colorSampleDiv)

    _addCloseButton: ->
      $p = $('<p class="clear" style="text-align: center; margin-top: 30px" />');
      @$closeButton = $('<a href="#" />').html("Close box")
      @$closeButton.bind("click" => @close())
      $p.append(@$closeButton)
      @$container.append($p)

    _addEvents: ->
      @_bindEvents document,
        keyup: (event) =>
          key = event.keyCode
          @close() if key == Keyboard.ESC_KEY

      @$hueSatDiv.mouseTracker
        "mousedown mousedrag": =>
          @_positionHueSatSelectorFromMouse()
          @_setHueAndSatFromSelectorPosition()
          @_setColorFields()
          @_setColorSample()
          @_drawLightnessCanvas()
          @options?.change.call(this, @currentColor)

      @$lumDiv.mouseTracker
        "mousedown mousedrag": =>
          @_positionLightnessSelectorFromMouse()
          @_setLightnessFromSelectorPosition()
          @_setColorFields()
          @_setColorSample()
          @options?.change.call(this, @currentColor)

    _removeEvents: ->
      @_unbindEvents(document, "keyup")
      @$hueSatDiv.mouseTracker("destroy")
      @$lumDiv.mouseTracker("destroy")

    _setColorFields: ->
      hsl = @currentColor
      rgb = hsl.toRGB()
      for prop in SpriteEditor.Color.RGB.properties
        @colorFields[prop]?.val String(rgb[prop])
      for prop in SpriteEditor.Color.HSL.properties
        @colorFields[prop]?.val String(hsl[prop])

    _positionHueSatSelectorFromMouse: ->
      mouse = @$hueSatDiv.mouseTracker("pos").rel
      # This 5 here is just a value I found matches up with the center of the selector image
      top = mouse.y - 5
      left = mouse.x - 5
      @$hueSatSelectorDiv.css("background-position", left+"px "+top+"px")

    _positionLightnessSelectorFromMouse: ->
      mouse = @$lumDiv.mouseTracker("pos").rel
      top = mouse.y - 5
      @$lumDiv.css("background-position", "0px "+top+"px")

    _positionHueSatSelectorFromColor: ->
      top = @_sat2px()
      left = @_hue2px()
      @$hueSatSelectorDiv.css("background-position", left+"px "+top+"px")

    _positionLightnessSelectorFromColor: ->
      top = @_lum2px()
      @$lumDiv.css("background-position", "0px "+top+"px")

    _setHueAndSatFromSelectorPosition: ->
      @currentColor = @currentColor.with( hue: @_px2hue(), sat: @_px2sat() )

    _setLightnessFromSelectorPosition: ->
      @currentColor = @currentColor.with( lum: @_px2lum() )

    _setColorSample: ->
      @$colorSampleDiv.css("background-color", @currentColor.toRGB().toString())

    _sat2px: ->
      s = @currentColor.sat
      h = @hueSatCanvasSize.height
      # s = 100..0 -> y = 0..height
      y = Math.round(-s * (h / 100) + h)
      return y

    _px2sat: ->
      pos = @$hueSatDiv.mouseTracker("pos").rel
      y = pos.y
      h = @hueSatCanvasSize.height
      # y = 0..height -> s = 100..0
      s = Math.round(-100 * (y - h) / h)
      return s

    _hue2px: ->
      h = @currentColor.hue
      w = @hueSatCanvasSize.width
      # h = 0..360 -> x = 0..width
      x = Math.round(h * (w / 360))
      return x

    _px2hue: ->
      pos = @$hueSatDiv.mouseTracker("pos").rel
      x = pos.x
      w = @hueSatCanvasSize.width
      # x = 0..width -> h = 0..360
      h = Math.round((360 * x) / w)
      return h

    _lum2px: ->
      l = @currentColor.lum
      h = @lumCanvasSize.height
      # l = 100..0 -> y = 0..height
      y = Math.round(-l * (h / 100) + h)
      return y

    _px2lum: ->
      self = this
      pos = @$lumDiv.mouseTracker("pos").rel
      y = pos.y
      h = @lumCanvasSize.height
      # l = 100..0 -> y = 0..height
      l = Math.round(-100 * (y - h) / h)
      return l

  return ColorPickerBox