Color = SpriteEditor.Color

describe "Color", ->
  describe ".new", ->
    describe "an RGB color", ->
      it "accepts red, green, and blue properties (defaulting alpha to 1)", ->
        color = new Color(red: 90, green: 188, blue: 73)
        expect(color).toContainObject(red: 90, green: 188, blue: 73, alpha: 1)
      it "accepts an alpha property too", ->
        color = new Color(red: 90, green: 188, blue: 73, alpha: 0.5)
        expect(color).toContainObject(red: 90, green: 188, blue: 73, alpha: 0.5)
      it "bails if any of red, blue, or green are left out", ->
        msg = "An RGB color requires red, green, and blue properties!"
        expect(-> new Color(red: 90)).toThrow(msg)
        expect(-> new Color(green: 188)).toThrow(msg)
        expect(-> new Color(blue: 73)).toThrow(msg)
        expect(-> new Color(red: 90, green: 188)).toThrow(msg)
        expect(-> new Color(green: 90, blue: 188)).toThrow(msg)
        expect(-> new Color(red: 90, blue: 188)).toThrow(msg)
    describe "an HSL color", ->
      it "accepts hue, sat, and lum properties (defaulting alpha to 1)", ->
        color = new Color(hue: 111, sat: 46, lum: 51)
        expect(color).toContainObject(hue: 111, sat: 46, lum: 51, alpha: 1)
      it "accepts an alpha property too", ->
        color = new Color(hue: 111, sat: 46, lum: 51, alpha: 0.5)
        expect(color).toContainObject(hue: 111, sat: 46, lum: 51, alpha: 0.5)
      it "bails if any of hue, sat, or lum are left out", ->
        msg = "An HSL color requires hue, sat, and lum properties!"
        expect(-> new Color(hue: 111)).toThrow(msg)
        expect(-> new Color(sat: 46)).toThrow(msg)
        expect(-> new Color(lum: 51)).toThrow(msg)
        expect(-> new Color(hue: 111, sat: 46)).toThrow(msg)
        expect(-> new Color(sat: 46, lum: 51)).toThrow(msg)
        expect(-> new Color(hue: 111, lum: 51)).toThrow(msg)
    it "bails if RGB and HSL properties are mixed", ->
      msg = "To set a Color, you must pass either RGB properties or HSL properties, but not both!"
      expect(-> new Color(red: 90, hue: 111)).toThrow(msg)
      expect(-> new Color(blue: 73, green: 90, sat: 46, lum: 51)).toThrow(msg)
      expect(-> new Color(red: 90, green: 188, blue: 73, hue: 111, sat: 46, lum: 51)).toThrow(msg)

  describe ".rgb2hsl", ->
    it "works for (0, 0, 0)", ->
      rgb = {red: 0, green: 0, blue: 0}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 0, sat: 0, lum: 0)

    it "returns a hue of null of (0, 0, 0) if correctHue: false passed", ->
      rgb = {red: 0, green: 0, blue: 0, correctHue: false}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: null, sat: 0, lum: 0)

    it "works for (0, 0, 127)", ->
      rgb = {red: 0, green: 0, blue: 127}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 240, sat: 100, lum: 25)

    it "works for (0, 0, 255)", ->
      rgb = {red: 0, green: 0, blue: 255}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 240, sat: 100, lum: 50)

    it "works for (0, 127, 0)", ->
      rgb = {red: 0, green: 127, blue: 0}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 120, sat: 100, lum: 25)

    it "works for (0, 127, 127)", ->
      rgb = {red: 0, green: 127, blue: 127}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 180, sat: 100, lum: 25)

    it "works for (0, 127, 255)", ->
      rgb = {red: 0, green: 127, blue: 255}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 210, sat: 100, lum: 50)

    it "works for (0, 255, 0)", ->
      rgb = {red: 0, green: 255, blue: 0}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 120, sat: 100, lum: 50)

    it "works for (0, 255, 127)", ->
      rgb = {red: 0, green: 255, blue: 127}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 150, sat: 100, lum: 50)

    it "works for (0, 255, 255)", ->
      rgb = {red: 0, green: 255, blue: 255}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 180, sat: 100, lum: 50)

    it "works for (127, 0, 0)", ->
      rgb = {red: 127, green: 0, blue: 0}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 0, sat: 100, lum: 25)

    it "still returns a hue of 0 for (127, 0, 0) if correctHue: false passed", ->
      rgb = {red: 127, green: 0, blue: 0, correctHue: false}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 0, sat: 100, lum: 25)

    it "works for (127, 0, 127)", ->
      rgb = {red: 127, green: 0, blue: 127}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 300, sat: 100, lum: 25)

    it "works for (127, 0, 255)", ->
      rgb = {red: 127, green: 0, blue: 255}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 270, sat: 100, lum: 50)

    it "works for (127, 127, 0)", ->
      rgb = {red: 127, green: 127, blue: 0}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 60, sat: 100, lum: 25)

    it "works for (127, 127, 127)", ->
      rgb = {red: 127, green: 127, blue: 127}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 0, sat: 0, lum: 50)

    it "returns a hue of null for (127, 127, 127) if correctHue: false passed", ->
      rgb = {red: 127, green: 127, blue: 127, correctHue: false}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: null, sat: 0, lum: 50)

    it "works for (127, 127, 255)", ->
      rgb = {red: 127, green: 127, blue: 255}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 240, sat: 100, lum: 75)

    it "works for (127, 255, 0)", ->
      rgb = {red: 127, green: 255, blue: 0}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 90, sat: 100, lum: 50)

    it "works for (127, 255, 127)", ->
      rgb = {red: 127, green: 255, blue: 127}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 120, sat: 100, lum: 75)

    it "works for (127, 255, 255)", ->
      rgb = {red: 127, green: 255, blue: 255}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 180, sat: 100, lum: 75)

    it "works for (255, 0, 0)", ->
      rgb = {red: 255, green: 0, blue: 0}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 0, sat: 100, lum: 50)

    it "still returns a hue of 0 for (255, 0, 0) if correctHue: false was passed", ->
      rgb = {red: 255, green: 0, blue: 0, correctHue: false}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 0, sat: 100, lum: 50)

    it "works for (255, 0, 127)", ->
      rgb = {red: 255, green: 0, blue: 127}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 330, sat: 100, lum: 50)

    it "works for (255, 0, 255)", ->
      rgb = {red: 255, green: 0, blue: 255}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 300, sat: 100, lum: 50)

    it "works for (255, 127, 0)", ->
      rgb = {red: 255, green: 127, blue: 0}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 30, sat: 100, lum: 50)

    it "works for (255, 127, 127)", ->
      rgb = {red: 255, green: 127, blue: 127}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 0, sat: 100, lum: 75)

    it "still returns a hue of 0 for (255, 127, 127) if correctHue: false was passed", ->
      rgb = {red: 255, green: 127, blue: 127, correctHue: false}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 0, sat: 100, lum: 75)

    it "works for (255, 127, 255)", ->
      rgb = {red: 255, green: 127, blue: 255}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 300, sat: 100, lum: 75)

    it "works for (255, 255, 0)", ->
      rgb = {red: 255, green: 255, blue: 0}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 60, sat: 100, lum: 50)

    it "works for (255, 255, 127)", ->
      rgb = {red: 255, green: 255, blue: 127}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 60, sat: 100, lum: 75)

    it "works for (255, 255, 255)", ->
      rgb = {red: 255, green: 255, blue: 255}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: 0, sat: 100, lum: 100)

    it "returns a hue of null for (255, 255, 255) if correctHue: false was passed", ->
      rgb = {red: 255, green: 255, blue: 255, correctHue: false}
      hsl = Color.rgb2hsl(rgb)
      expect(hsl).toEqual(hue: null, sat: 100, lum: 100)

  describe ".hsl2rgb", ->
    it "works for (0, 0, 0)", ->
      hsl = {hue: 0, sat: 0, lum: 0}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 0, green: 0, blue: 0)

    it "works for (0, 0, 50)", ->
      hsl = {hue: 0, sat: 0, lum: 50}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 128, green: 128, blue: 128)

    it "works for (0, 0, 100)", ->
      hsl = {hue: 0, sat: 0, lum: 100}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 255, green: 255, blue: 255)

    it "works for (0, 50, 0)", ->
      hsl = {hue: 0, sat: 50, lum: 0}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 0, green: 0, blue: 0)

    it "works for (0, 50, 50)", ->
      hsl = {hue: 0, sat: 50, lum: 50}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 191, green: 64, blue: 64)

    it "works for (0, 50, 100)", ->
      hsl = {hue: 0, sat: 50, lum: 100}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 255, green: 255, blue: 255)

    it "works for (0, 100, 0)", ->
      hsl = {hue: 0, sat: 100, lum: 0}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 0, green: 0, blue: 0)

    it "works for (0, 100, 50)", ->
      hsl = {hue: 0, sat: 100, lum: 50}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 255, green: 0, blue: 0)

    it "works for (0, 100, 100)", ->
      hsl = {hue: 0, sat: 100, lum: 100}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 255, green: 255, blue: 255)

    it "works for (90, 0, 0)", ->
      hsl = {hue: 90, sat: 0, lum: 0}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 0, green: 0, blue: 0)

    it "works for (90, 0, 50)", ->
      hsl = {hue: 90, sat: 0, lum: 50}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 128, green: 128, blue: 128)

    it "works for (90, 0, 100)", ->
      hsl = {hue: 90, sat: 0, lum: 100}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 255, green: 255, blue: 255)

    it "works for (90, 50, 0)", ->
      hsl = {hue: 90, sat: 50, lum: 0}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 0, green: 0, blue: 0)

    it "works for (90, 50, 50)", ->
      hsl = {hue: 90, sat: 50, lum: 50}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 128, green: 191, blue: 64)

    it "works for (90, 50, 100)", ->
      hsl = {hue: 90, sat: 50, lum: 100}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 255, green: 255, blue: 255)

    it "works for (90, 100, 0)", ->
      hsl = {hue: 90, sat: 100, lum: 0}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 0, green: 0, blue: 0)

    it "works for (90, 100, 50)", ->
      hsl = {hue: 90, sat: 100, lum: 50}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 128, green: 255, blue: 0)

    it "works for (90, 100, 100)", ->
      hsl = {hue: 90, sat: 100, lum: 100}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 255, green: 255, blue: 255)

    it "works for (180, 0, 0)", ->
      hsl = {hue: 180, sat: 0, lum: 0}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 0, green: 0, blue: 0)

    it "works for (180, 0, 50)", ->
      hsl = {hue: 180, sat: 0, lum: 50}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 128, green: 128, blue: 128)

    it "works for (180, 0, 100)", ->
      hsl = {hue: 180, sat: 0, lum: 100}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 255, green: 255, blue: 255)

    it "works for (180, 100, 0)", ->
      hsl = {hue: 180, sat: 100, lum: 0}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 0, green: 0, blue: 0)

    it "works for (180, 100, 50)", ->
      hsl = {hue: 180, sat: 100, lum: 50}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 0, green: 255, blue: 255)

    it "works for (180, 100, 100)", ->
      hsl = {hue: 180, sat: 100, lum: 100}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 255, green: 255, blue: 255)

    it "works for (270, 0, 0)", ->
      hsl = {hue: 270, sat: 0, lum: 0}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 0, green: 0, blue: 0)

    it "works for (270, 0, 50)", ->
      hsl = {hue: 270, sat: 0, lum: 50}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 128, green: 128, blue: 128)

    it "works for (270, 0, 100)", ->
      hsl = {hue: 270, sat: 0, lum: 100}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 255, green: 255, blue: 255)

    it "works for (270, 50, 0)", ->
      hsl = {hue: 270, sat: 50, lum: 0}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 0, green: 0, blue: 0)

    it "works for (270, 50, 50)", ->
      hsl = {hue: 270, sat: 50, lum: 50}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 127, green: 64, blue: 191)

    it "works for (270, 50, 100)", ->
      hsl = {hue: 270, sat: 50, lum: 100}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 255, green: 255, blue: 255)

    it "works for (270, 100, 0)", ->
      hsl = {hue: 270, sat: 100, lum: 0}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 0, green: 0, blue: 0)

    it "works for (270, 100, 50)", ->
      hsl = {hue: 270, sat: 100, lum: 50}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 127, green: 0, blue: 255)

    it "works for (270, 100, 100)", ->
      hsl = {hue: 270, sat: 100, lum: 100}
      rgb = Color.hsl2rgb(hsl)
      expect(rgb).toEqual(red: 255, green: 255, blue: 255)
