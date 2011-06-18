$.export "SpriteEditor.Color", (SpriteEditor) ->

  class Color
    @componentsByRepresentation:
      rgb: [ "red", "green", "blue" ]
      hsl: [ "hue", "sat", "lum" ]
    @correctHue: true

    # Much of the code in the next three methods were stolen from <http://hslpicker.com>,
    # which in turn was adapted from the SASS source
    # which in turn was adapted from algorithms on <http://en.wikipedia.org/wiki/HSL_and_HSV>

    @rgb2hsl: (rgb) ->
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
          # According to the spec, hue is undefined when min == max,
          # but for display purposes this isn't very convenient, so let's correct this by default
          h = 0 if @correctHue
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

      hsl.hue = Math.round(h) if h?
      hsl.sat = Math.round(s * 100)
      hsl.lum = Math.round(l * 100)

      return hsl

    @hsl2rgb: (hsl) ->
      rgb = {}

      h = (hsl.hue || 0) / 360
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

      rgb.red   = Math.round(@_hue2rgb(p, q, tr) * 255)
      rgb.green = Math.round(@_hue2rgb(p, q, tg) * 255)
      rgb.blue  = Math.round(@_hue2rgb(p, q, tb) * 255)

      return rgb

    @_hue2rgb: (p, q, h) ->
      if h < 0
        h += 1
      else if (h > 1)
        h -= 1

      if (h * 6) < 1 then return p + (q - p) * h * 6
      if (h * 2) < 1 then return q
      if (h * 3) < 2 then return p + (q - p) * ((2 / 3) - h) * 6

      return p

  #-----------------------------------------------------------------------------

  class Color.RGB
    @properties: "red green blue alpha".split(" ")

    constructor: (red, green, blue, alpha) ->
      if arguments.length == 1 and $.v.is.obj(arguments[0])
        color = arguments[0]
        for prop in Color.RGB.properties
          @[prop] = color[prop]
      else
        @red = red
        @green = green
        @blue = blue
        if !alpha? and (red? or green? or blue?)
          @alpha = 1
        else
          @alpha = alpha

    with: (props) ->
      clone = @clone()
      for prop in Color.RGB.properties
        clone[prop] = props[prop] if prop of props
      clone

    toRGB: -> this

    toHSL: ->
      if @isClear()
        new Color.HSL()
      else
        hsl = Color.rgb2hsl(this)
        new Color.HSL(hsl.hue, hsl.sat, hsl.lum, @alpha)

    isClear: ->
      !(@red? or @green? or @blue?)

    clone: ->
      new Color.RGB(this)

    toString: ->
      values = (@[prop] || 0 for prop in Color.RGB.properties)
      "rgba(" + values.join(", ") + ")"

    eq: (other) ->
      $.v.every(Color.RGB.properties, (prop) => @[prop] == other[prop])

  #-----------------------------------------------------------------------------

  class Color.HSL
    @properties: "hue sat lum alpha".split(" ")

    constructor: (hue, sat, lum, alpha) ->
      if arguments.length == 1 and $.v.is.obj(arguments[0])
        color = arguments[0]
        for prop in Color.HSL.properties
          @[prop] = color[prop]
      else
        @hue = hue
        @sat = sat
        @lum = lum
        if !alpha? and (red? or green? or blue?)
          @alpha = 1
        else
          @alpha = alpha

    with: (props) ->
      clone = @clone()
      for prop in Color.HSL.properties
        clone[prop] = props[prop] if prop of props
      clone

    toRGB: ->
      if @isClear()
        new Color.RGB()
      else
        rgb = Color.hsl2rgb(this)
        new Color.RGB(rgb.red, rgb.green, rgb.blue, @alpha)

    toHSL: -> this

    isClear: ->
      !(@hue? or @sat? or @lum?)

    clone: ->
      new Color.HSL(this)

    toString: ->
      values = (@[prop] || 0 for prop in Color.HSL.properties)
      "hsla(" + values.join(", ") + ")"

    eq: (other) ->
      $.v.every(Color.HSL.properties, (prop) => @[prop] == other[prop])

  return Color