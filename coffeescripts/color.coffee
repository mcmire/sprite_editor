((window, $) ->
  Color = 
    componentsByRepresentation: 
      rgb: [ "red", "green", "blue" ]
      hsl: [ "hue", "sat", "lum" ]
    
    correctHue: true
    rgb2hsl: (rgb) ->
      self = this
      hsl = {}
      r = rgb.red / 255
      g = rgb.green / 255
      b = rgb.blue / 255
      max = Math.max(r, g, b)
      min = Math.min(r, g, b)
      diff = max - min
      sum = min + max
      
      switch max
        when min
          h = (if self.correctHue then 0 else null)
        when r
          h = ((60 * (g - b) / diff) + 360) % 360
        when g
          h = (60 * (b - r) / diff) + 120
        when b
          h = (60 * (r - g) / diff) + 240
      l = sum / 2
      
      if l == 0
        s = 0
      else if l == 1
        s = 1
      else if l <= 0.5
        s = diff / sum
      else
        s = diff / (2 - sum)
      hsl.hue = (if h == null then null else Math.round(h))
      hsl.sat = Math.round(s * 100)
      hsl.lum = Math.round(l * 100)
      hsl
    
    hsl2rgb: (hsl) ->
      self = this
      rgb = {}
      h = (hsl.hue or 0) / 360
      s = hsl.sat / 100
      l = hsl.lum / 100
      if l <= 0.5
        q = l * (1 + s)
      else
        q = l + s - (l * s)
      p = 2 * l - q
      tr = h + (1 / 3)
      tg = h
      tb = h - (1 / 3)
      rgb.red = Math.round(self._hue2rgb(p, q, tr) * 255)
      rgb.green = Math.round(self._hue2rgb(p, q, tg) * 255)
      rgb.blue = Math.round(self._hue2rgb(p, q, tb) * 255)
      rgb
    
    _hue2rgb: (p, q, h) ->
      if h < 0
        h += 1
      else h -= 1  if h > 1
      if (h * 6) < 1
        p + (q - p) * h * 6
      else if (h * 2) < 1
        q
      else if (h * 3) < 2
        p + (q - p) * ((2 / 3) - h) * 6
      else
        p
  
  Color.RGB = (red, green, blue, alpha) ->
    self = this
    if arguments.length == 1 and typeof arguments[0] == "object"
      color = arguments[0]
      $.v.each Color.RGB.properties, (prop) ->
        self[prop] = color[prop]
    else
      self.red = red
      self.green = green
      self.blue = blue
      if typeof alpha == "undefined" and (typeof red != "undefined" or typeof green != "undefined" or typeof blue != "undefined")
        self.alpha = 1
      else
        self.alpha = alpha
  
  $.extend Color.RGB, properties: "red green blue alpha".split(" ")
  $.extend Color.RGB::, 
    with: (props) ->
      self = this
      clone = self.clone()
      $.v.each Color.RGB.properties, (prop) ->
        clone[prop] = props[prop]  if prop of props
      
      clone
    
    toRGB: ->
      this
    
    toHSL: ->
      self = this
      if self.isClear()
        new Color.HSL()
      else
        hsl = Color.rgb2hsl(self)
        new Color.HSL(hsl.hue, hsl.sat, hsl.lum, self.alpha)
    
    isClear: ->
      self = this
      $.v.every Color.RGB.properties, (prop) ->
        typeof self[prop] == "undefined"
    
    clone: ->
      self = this
      clone = new Color.RGB(self)
      clone
    
    toString: ->
      self = this
      values = $.v.map(Color.RGB.properties, (prop) ->
        self[prop] or 0
      )
      "rgba(" + values.join(", ") + ")"
    
    eq: (other) ->
      self = this
      $.v.every Color.RGB.properties, (prop) ->
        self[prop] == other[prop]
  
  Color.HSL = (hue, sat, lum, alpha) ->
    self = this
    if arguments.length == 1 and typeof arguments[0] == "object"
      color = arguments[0]
      $.v.each Color.HSL.properties, (prop) ->
        self[prop] = color[prop]
    else
      self.hue = hue
      self.sat = sat
      self.lum = lum
      if typeof alpha == "undefined" and (typeof hue != "undefined" or typeof sat != "undefined" or typeof lum != "undefined")
        self.alpha = 1
      else
        self.alpha = alpha
  
  $.extend Color.HSL, properties: "hue sat lum alpha".split(" ")
  $.extend Color.HSL::, 
    with: (props) ->
      self = this
      clone = self.clone()
      $.v.each Color.HSL.properties, (prop) ->
        clone[prop] = props[prop]  if prop of props
      
      clone
    
    toRGB: ->
      self = this
      if self.isClear()
        new Color.RGB()
      else
        rgb = Color.hsl2rgb(self)
        new Color.RGB(rgb.red, rgb.green, rgb.blue, self.alpha)
    
    toHSL: ->
      this
    
    isClear: ->
      self = this
      $.v.every Color.HSL.properties, (prop) ->
        typeof self[prop] == "undefined"
    
    clone: ->
      self = this
      clone = new Color.HSL(self)
      clone
    
    toString: ->
      self = this
      values = $.v.map(Color.HSL.properties, (prop) ->
        self[prop] or 0
      )
      "hsla(" + values.join(", ") + ")"
    
    eq: (other) ->
      self = this
      $.v.every Color.HSL.properties, (prop) ->
        self[prop] == other[prop]
  
  $.export "SpriteEditor.Color", Color
) window, window.ender
