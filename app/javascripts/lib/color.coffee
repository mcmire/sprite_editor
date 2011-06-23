$.export "SpriteEditor.Color", (SpriteEditor) ->

  # Much of the code here was borrowed from a few choice sources:
  # hslpicker.com [1], the Color class in the Sass source [2],
  # and algorithms on Wikipedia [3] and the CSS3 spec [4].
  #
  # [1]: https://github.com/imathis/hsl-color-picker/blob/master/javascripts/slider.js>
  # [2]: https://github.com/nex3/sass/blob/master/lib/sass/script/color.rb
  # [3]: http://en.wikipedia.org/wiki/HSL_and_HSV
  # [4]: http://www.w3.org/TR/css3-color/#hsl-color
  #
  class Color
    @componentsByType:
      rgb: "red green blue".split(" ")
      hsl: "hue sat lum".split(" ")
    @allComponents: @componentsByType.rgb.concat(@componentsByType.hsl)

    @propertiesByType:
      rgb: @componentsByType.rgb.concat(["alpha"])
      hsl: @componentsByType.hsl.concat(["alpha"])
    @allProperties: @allComponents.concat(["alpha"])

    @rgb2hsl: (rgb) ->
      hsl = {}
      correctHue = rgb.correctHue ? true

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
          h = 0 if correctHue
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

      hsl.hue = (if h? then Math.round(h) else null)
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

    constructor: (args) ->
      if args?
        if args instanceof Color or args._s?
          for prop of args
            @[prop] = args[prop] unless prop is "_s"
        else
          @set(args, (type) ->
            components = Color.componentsByType[type]
            if !$.v.every(components, (prop) -> args[prop]?)
              throw "An #{type.toUpperCase()} color requires #{components[0..1].join(", ")}, and #{components[2]} properties!"
          )
      @alpha = 1 if !@alpha? and @isFilled()
      @correctHue = true

    set: (args, onDetectType) ->
      if type = @_detectType(args)
        onDetectType?(type)
        for prop in Color.componentsByType[type]
          @[prop] = args[prop] if args[prop]?
        if type == "rgb"
          @_recalculateHSL()
        else
          @_recalculateRGB()
      @alpha = args.alpha if args.alpha?

    with: (args) ->
      clone = @clone()
      clone.set(args)
      clone

    isFilled: ->
      self = this
      $.v.some(Color.allComponents, (prop) -> self[prop]?)

    isClear: ->
      !@isFilled()

    clone: ->
      new Color(this)

    toJSON: ->
      JSON.stringify(
        # tells Color.new not to bomb since properties of both types are present
        _s: true,
        red: @red, green: @green, blue: @blue,
        hue: @hue, sat: @sat, lum: @lum,
        alpha: @alpha
      )

    toRGBAString: ->
      values = (@[prop] ? "null" for prop in Color.propertiesByType.rgb)
      "rgba(" + values.join(", ") + ")"

    toHSLAString: ->
      values = (@[prop] ? "null" for prop in Color.propertiesByType.hsl)
      "hsla(" + values.join(", ") + ")"

    inspect: ->
      "{rgba: #{@toRGBAString()}, hsla: #{@toHSLAString()}}"

    eq: (other) ->
      self = this
      $.v.every(Color.allProperties, (prop) => self[prop] == other[prop])

    _recalculateRGB: ->
      $.extend this, Color.hsl2rgb(this)

    _recalculateHSL: ->
      $.extend this, Color.rgb2hsl(this)

    _detectType: (args, sig) ->
      # Either red, green, and blue can passed, or hue, sat, and lum,
      # but not a mixture (alpha is always optional).
      # Blank properties will be ignored.
      count = 0
      count += 1 if $.v.some(Color.componentsByType.rgb, (prop) -> args[prop]?)
      count += 2 if $.v.some(Color.componentsByType.hsl, (prop) -> args[prop]?)
      switch count
        when 3
          throw "To set a Color, you must pass either RGB properties or HSL properties, but not both!"
        when 2
          return "hsl"
        when 1
          return "rgb"
        else
          return null