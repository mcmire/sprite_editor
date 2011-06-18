$.export "SpriteEditor.ColorPicker", (SpriteEditor) ->

  Keyboard = SpriteEditor.Keyboard

  ColorPicker = {}
  SpriteEditor.DOMEventHelpers.mixin(ColorPicker, "SpriteEditor_ColorPicker")

  $.extend ColorPicker,
    $container: null
    hueSatCanvas: null
    lumCanvas: null
    colorFields: {}

    hueSatCanvasSize: {width: 265, height: 300}
    lumCanvasSize: {width: 25, height: 300}
    currentColor: new SpriteEditor.Color(red: 255, blue: 0, green: 0)
    currentColorType: null

    init: (@app, @options) ->
      @$container = $('<div class="square_color_picker dialog" />').hide()

      @_addHueSatDiv()
      @_addLumDiv()
      @_addColorFields()
      @_addColorSample()
      @_addCloseButton()

      return this

    addEvents: ->
      self = this

      @_bindEvents document,
        keyup: (event) ->
          key = event.keyCode
          self.close() if key == Keyboard.ESC_KEY

      @$hueSatDiv.mouseTracker
        "mousedown mousedrag": ->
          self._positionHueSatSelectorFromMouse()
          self._setHueAndSatFromSelectorPosition()
          self._drawLumCanvas()
          self.update()

      @$lumDiv.mouseTracker
        "mousedown mousedrag": ->
          self._positionLumSelectorFromMouse()
          self._setLumFromSelectorPosition()
          self.update()

    removeEvents: ->
      @_unbindEvents(document, "keyup")
      @$hueSatDiv.mouseTracker("destroy")
      @$lumDiv.mouseTracker("destroy")

    open: (color, colorType) ->
      @currentColor = color
      @currentColorType = colorType

      @trigger("open")

      @$container.show().center()

      @_drawLumCanvas()
      @_setColorFields()
      @_positionHueSatSelectorFromColor()
      @_positionLumSelectorFromColor()
      @_setColorSample()

      @addEvents()

    close: ->
      @currentColorType = null
      @$container.hide()
      @removeEvents()
      @trigger("close")

    trigger: (method, args...) ->
      @options[method]?.apply(this, args)

    update: ->
      @_setColorFields()
      @_setColorSample()
      @app.boxes.colors.update(@currentColor)

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
      @hueSatCanvas = SpriteEditor.Canvas.create @hueSatCanvasSize.width, @hueSatCanvasSize.height, (c) =>
        imageData = c.ctx.createImageData(c.width, c.height)
        hsl = @currentColor
        # TODO: Use a gradient for this instead of manually filling in pixels
        for y in [0...c.height]
          for x in [0...c.width]
            # x = 0..width  -> h = 0..360
            # y = 0..height -> s = 100..0
            h = Math.round(x * (360 / c.width))
            s = Math.round(y * (-100 / c.height) + 100)
            rgb = hsl.with(hue: h, sat: s)
            imageData.setPixel(x, y, rgb.red, rgb.green, rgb.blue, 255)
        c.ctx.putImageData(imageData, 0, 0)

      @hueSatCanvas.$element.addClass("hue_sat_canvas")
      @$hueSatDiv.append(@hueSatCanvas.$element)

    _addHueSatSelectorDiv: ->
      @$hueSatSelectorDiv = $('<div class="hue_sat_selector" />')
      @$hueSatDiv.append(@$hueSatSelectorDiv)

    _addLumDiv: ->
      @$lumDiv = $("<div class=\"lum_div\" />")
      @$lumDiv.css {
        width: @lumCanvasSize.width + 11
        height: @lumCanvasSize.height
      }
      @$container.append(@$lumDiv)

      @_addLumCanvas()

    _addLumCanvas: ->
      @lumCanvas = SpriteEditor.Canvas.create(@lumCanvasSize.width, @lumCanvasSize.height)
      @lumCanvas.$element.addClass("lum_canvas")
      @$lumDiv.append(@lumCanvas.$element)

    _drawLumCanvas: ->
      c = @lumCanvas
      imageData = c.ctx.createImageData(c.width, c.height)
      hsl = @currentColor
      # TODO: Use a gradient for this instead of manually filling in pixels
      for y in [0...c.height]
        # y = 0..height -> l = 100..0
        l = Math.round((-100 / c.height) * y + 100)
        rgb = hsl.with(lum: l)
        for x in [0...c.width]
          imageData.setPixel(x, y, rgb.red, rgb.green, rgb.blue, 255)
      c.ctx.putImageData(imageData, 0, 0)

    _addColorFields: ->
      @$colorFieldsDiv = $('<div class="color_fields" />')
      for type, props of SpriteEditor.Color.componentsByType
        $colorTypeFieldsDiv = $('<div class="'+type+'_fields" />')
        for prop in props
          $colorSpan = $('<span />')
          $colorField = $('<input type="text" size="3" />')
          @colorFields[prop] = $colorField
          $colorSpan.html(prop[0].toUpperCase() + ": ").append($colorField)
          $colorTypeFieldsDiv.append($colorSpan)
        @$colorFieldsDiv.append($colorTypeFieldsDiv)
      @$container.append(@$colorFieldsDiv)

    _addColorSample: ->
      @$colorSampleDiv = $('<div class="color_sample" />')
      @$container.append(@$colorSampleDiv)

    _addCloseButton: ->
      $p = $('<p class="clear" style="text-align: center; margin-top: 30px" />');
      @$closeButton = $('<a href="#" />').html("Close box")
      @$closeButton.bind("click", => @close())
      $p.append(@$closeButton)
      @$container.append($p)

    _setColorFields: ->
      color = @currentColor
      for prop in SpriteEditor.Color.componentsByType.rgb
        @colorFields[prop]?.val String(color[prop])
      for prop in SpriteEditor.Color.componentsByType.hsl
        @colorFields[prop]?.val String(color[prop])

    _positionHueSatSelectorFromMouse: ->
      mouse = @$hueSatDiv.mouseTracker("pos").rel
      # This 5 here is just a value I found matches up with the center of the selector image
      top = mouse.y - 5
      left = mouse.x - 5
      @$hueSatSelectorDiv.css("background-position", left+"px "+top+"px")

    _positionLumSelectorFromMouse: ->
      mouse = @$lumDiv.mouseTracker("pos").rel
      # Same thing for this
      top = mouse.y - 5
      @$lumDiv.css("background-position", "0px "+top+"px")

    _positionHueSatSelectorFromColor: ->
      top = @_sat2px()
      left = @_hue2px()
      @$hueSatSelectorDiv.css("background-position", left+"px "+top+"px")

    _positionLumSelectorFromColor: ->
      top = @_lum2px()
      @$lumDiv.css("background-position", "0px "+top+"px")

    _setHueAndSatFromSelectorPosition: ->
      @currentColor = @currentColor.with( hue: @_px2hue(), sat: @_px2sat() )

    _setLumFromSelectorPosition: ->
      @currentColor = @currentColor.with( lum: @_px2lum() )

    _setColorSample: ->
      @$colorSampleDiv.css("background-color", @currentColor.toRGBAString())

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

  return ColorPicker