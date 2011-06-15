((window, document, $, undefined_) ->
  ColorPickerBox = 
    hueSatCanvasSize: 
      width: 265
      height: 300
    
    lumCanvasSize: 
      width: 25
      height: 300
    
    currentColor: (new SpriteEditor.Color.RGB(255, 0, 0)).toHSL()
    $container: null
    hueSatCanvas: null
    lumCanvas: null
    colorFields: {}
    init: (options) ->
      self = this
      self.options = options
      self.$container = $("<div class=\"square_color_picker dialog\" />").hide()
      self._addHueSatDiv()
      self._addLightnessDiv()
      self._addColorFields()
      self._addColorSample()
      self._addCloseButton()
      self
    
    open: (color) ->
      self = this
      self.options.open.call self  if self.options.open
      self.$container.show()
      self.$container.center()
      self.currentColor = color
      self._drawLightnessCanvas()
      self._setColorFields()
      self._positionHueSatSelectorFromColor()
      self._positionLightnessSelectorFromColor()
      self._setColorSample()
      self._addEvents()
    
    close: ->
      self = this
      self.$container.hide()
      self._removeEvents()
      self.options.close.call self  if self.options.close
    
    _addHueSatDiv: ->
      self = this
      $div = self.$hueSatDiv = $("<div class=\"hue_sat_div\" />")
      $div.css 
        width: self.hueSatCanvasSize.width
        height: self.hueSatCanvasSize.height
      
      self.$container.append $div
      self._addHueSatCanvas()
      self._addHueSatSelectorDiv()
    
    _addHueSatCanvas: ->
      self = this
      self.hueSatCanvas = SpriteEditor.Canvas.create(self.hueSatCanvasSize.width, self.hueSatCanvasSize.height, (c) ->
        imageData = c.ctx.createImageData(c.width, c.height)
        hsl = self.currentColor
        y = 0
        
        while y < c.height
          x = 0
          
          while x < c.width
            h = Math.round(x * (360 / c.width))
            s = Math.round(y * (-100 / c.height) + 100)
            rgb = hsl["with"](
              hue: h
              sat: s
            ).toRGB()
            imageData.setPixel x, y, rgb.red, rgb.green, rgb.blue, 255
            x++
          y++
        c.ctx.putImageData imageData, 0, 0
      )
      self.hueSatCanvas.$element.addClass "hue_sat_canvas"
      self.$hueSatDiv.append self.hueSatCanvas.$element
    
    _addHueSatSelectorDiv: ->
      self = this
      self.$hueSatSelectorDiv = $("<div class=\"hue_sat_selector\" />")
      self.$hueSatDiv.append self.$hueSatSelectorDiv
    
    _addLightnessDiv: ->
      self = this
      self.$lumDiv = $("<div class=\"lum_div\" />")
      self.$lumDiv.css 
        width: self.lumCanvasSize.width + 11
        height: self.lumCanvasSize.height
      
      self.$container.append self.$lumDiv
      self._addLightnessCanvas()
    
    _addLightnessCanvas: ->
      self = this
      self.lumCanvas = SpriteEditor.Canvas.create(self.lumCanvasSize.width, self.lumCanvasSize.height)
      self.lumCanvas.$element.addClass "lum_canvas"
      self.$lumDiv.append self.lumCanvas.$element
    
    _drawLightnessCanvas: ->
      self = this
      c = self.lumCanvas
      imageData = c.ctx.createImageData(c.width, c.height)
      hsl = self.currentColor
      y = 0
      
      while y < c.height
        l = Math.round((-100 / c.height) * y + 100)
        rgb = hsl["with"](lum: l).toRGB()
        x = 0
        
        while x < c.width
          imageData.setPixel x, y, rgb.red, rgb.green, rgb.blue, 255
          x++
        y++
      c.ctx.putImageData imageData, 0, 0
    
    _addColorFields: ->
      self = this
      self.$colorFieldsDiv = $("<div class=\"color_fields\" />")
      $.v.each SpriteEditor.Color.componentsByRepresentation, (repName, rep) ->
        $repDiv = $("<div class=\"" + repName + "_fields\" />")
        $.v.each rep, (cpt) ->
          $colorSpan = $("<span />")
          $colorField = $("<input type=\"text\" size=\"3\" />")
          self.colorFields[cpt] = $colorField
          $colorSpan.html(cpt[0].toUpperCase() + ": ").append $colorField
          $repDiv.append $colorSpan
        
        self.$colorFieldsDiv.append $repDiv
      
      self.$container.append self.$colorFieldsDiv
    
    _addColorSample: ->
      self = this
      self.$colorSampleDiv = $("<div class=\"color_sample\" />")
      self.$container.append self.$colorSampleDiv
    
    _addCloseButton: ->
      self = this
      $p = $("<p class=\"clear\" style=\"text-align: center; margin-top: 30px\" />")
      self.$closeButton = $("<a href=\"#\" />").html("Close box")
      self.$closeButton.bind "click", ->
        self.close()
      
      $p.append self.$closeButton
      self.$container.append $p
    
    _addEvents: ->
      self = this
      $(document).bind "keyup.ColorPickerBox": (event) ->
        key = event.keyCode
        self.close()  if key == Keyboard.ESC_KEY
      
      self.$hueSatDiv.mouseTracker "mousedown mousedrag": ->
        self._positionHueSatSelectorFromMouse()
        self._setHueAndSatFromSelectorPosition()
        self._setColorFields()
        self._setColorSample()
        self._drawLightnessCanvas()
        self.options.change.call self, self.currentColor  if self.options.change
      
      self.$lumDiv.mouseTracker "mousedown mousedrag": ->
        self._positionLightnessSelectorFromMouse()
        self._setLightnessFromSelectorPosition()
        self._setColorFields()
        self._setColorSample()
        self.options.change.call self, self.currentColor  if self.options.change
    
    _removeEvents: ->
      self = this
      $(document).unbind "keyup.ColorPickerBox"
      self.$hueSatDiv.mouseTracker "destroy"
      self.$lumDiv.mouseTracker "destroy"
    
    _setColorFields: ->
      self = this
      hsl = self.currentColor
      rgb = hsl.toRGB()
      $.v.each SpriteEditor.Color.RGB.properties, (prop) ->
        self.colorFields[prop].val String(rgb[prop])  if self.colorFields[prop]
      
      $.v.each SpriteEditor.Color.HSL.properties, (prop) ->
        self.colorFields[prop].val String(hsl[prop])  if self.colorFields[prop]
    
    _positionHueSatSelectorFromMouse: ->
      self = this
      mouse = self.$hueSatDiv.mouseTracker("pos").rel
      top = mouse.y - 5
      left = mouse.x - 5
      self.$hueSatSelectorDiv.css "background-position", left + "px " + top + "px"
    
    _positionLightnessSelectorFromMouse: ->
      self = this
      mouse = self.$lumDiv.mouseTracker("pos").rel
      top = mouse.y - 5
      self.$lumDiv.css "background-position", "0px " + top + "px"
    
    _positionHueSatSelectorFromColor: ->
      self = this
      top = self._sat2px()
      left = self._hue2px()
      self.$hueSatSelectorDiv.css "background-position", left + "px " + top + "px"
    
    _positionLightnessSelectorFromColor: ->
      self = this
      top = self._lum2px()
      self.$lumDiv.css "background-position", "0px " + top + "px"
    
    _setHueAndSatFromSelectorPosition: ->
      self = this
      self.currentColor = self.currentColor["with"](
        hue: self._px2hue()
        sat: self._px2sat()
      )
    
    _setLightnessFromSelectorPosition: ->
      self = this
      self.currentColor = self.currentColor["with"](lum: self._px2lum())
    
    _setColorSample: ->
      self = this
      self.$colorSampleDiv.css "background-color", self.currentColor.toRGB().toString()
    
    _sat2px: ->
      self = this
      s = self.currentColor.sat
      h = self.hueSatCanvasSize.height
      y = Math.round(-s * (h / 100) + h)
      y
    
    _px2sat: ->
      self = this
      pos = self.$hueSatDiv.mouseTracker("pos").rel
      y = pos.y
      h = self.hueSatCanvasSize.height
      s = Math.round(-100 * (y - h) / h)
      s
    
    _hue2px: ->
      self = this
      h = self.currentColor.hue
      w = self.hueSatCanvasSize.width
      x = Math.round(h * (w / 360))
      x
    
    _px2hue: ->
      self = this
      pos = self.$hueSatDiv.mouseTracker("pos").rel
      x = pos.x
      w = self.hueSatCanvasSize.width
      h = Math.round((360 * x) / w)
      h
    
    _lum2px: ->
      self = this
      l = self.currentColor.lum
      h = self.lumCanvasSize.height
      y = Math.round(-l * (h / 100) + h)
      y
    
    _px2lum: ->
      self = this
      pos = self.$lumDiv.mouseTracker("pos").rel
      y = pos.y
      h = self.lumCanvasSize.height
      l = Math.round(-100 * (y - h) / h)
      l
  
  $.export "SpriteEditor.ColorPickerBox", ColorPickerBox
) window, window.document, window.ender
