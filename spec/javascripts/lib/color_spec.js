(function() {
  var Color;
  Color = SpriteEditor.Color;
  describe("Color", function() {
    describe(".new", function() {
      return it("accepts a hash of color components and stores them in a new Color object", function() {
        var color;
        color = new Color({
          red: 90,
          green: 188,
          blue: 73,
          hue: 111,
          saturation: 46,
          lightness: 51
        });
        expect(color.red).toEqual(90);
        expect(color.green).toEqual(188);
        expect(color.blue).toEqual(73);
        expect(color.hue).toEqual(111);
        expect(color.saturation).toEqual(46);
        return expect(color.lightness).toEqual(51);
      });
    });
    describe(".fromRGB", function() {
      beforeEach(function() {
        var color;
        return color = Color.fromRGB(90, 188, 73);
      });
      it("accepts the RGB components and stores them in a new Color object", function() {
        expect(color.red).toEqual(90);
        expect(color.green).toEqual(188);
        return expect(color.blue).toEqual(73);
      });
      return it("also calculates and fills in the HSL components", function() {
        expect(color.hue).toEqual(111);
        expect(color.saturation).toEqual(46);
        return expect(color.lightness).toEqual(51);
      });
    });
    describe(".fromHSL", function() {
      beforeEach(function() {
        var color;
        return color = Color.fromHSL(111, 46, 51);
      });
      it("accepts the RGB components and stores them in a new Color object", function() {
        expect(color.hue).toEqual(111);
        expect(color.saturation).toEqual(46);
        return expect(color.lightness).toEqual(51);
      });
      return it("also calculates and fills in the RGB components", function() {
        expect(color.red).toEqual(90);
        expect(color.green).toEqual(188);
        return expect(color.blue).toEqual(73);
      });
    });
    describe(".rgb2hsl", function() {
      it("works for (0, 0, 0)", function() {
        var hsl, rgb;
        rgb = {
          red: 0,
          green: 0,
          blue: 0
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: null,
          saturation: 0,
          lightness: 0
        });
      });
      it("works for (0, 0, 127)", function() {
        var hsl, rgb;
        rgb = {
          red: 0,
          green: 0,
          blue: 127
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 240,
          saturation: 100,
          lightness: 25
        });
      });
      it("works for (0, 0, 255)", function() {
        var hsl, rgb;
        rgb = {
          red: 0,
          green: 0,
          blue: 255
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 240,
          saturation: 100,
          lightness: 50
        });
      });
      it("works for (0, 127, 0)", function() {
        var hsl, rgb;
        rgb = {
          red: 0,
          green: 127,
          blue: 0
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 120,
          saturation: 100,
          lightness: 25
        });
      });
      it("works for (0, 127, 127)", function() {
        var hsl, rgb;
        rgb = {
          red: 0,
          green: 127,
          blue: 127
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 180,
          saturation: 100,
          lightness: 25
        });
      });
      it("works for (0, 127, 255)", function() {
        var hsl, rgb;
        rgb = {
          red: 0,
          green: 127,
          blue: 255
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 210,
          saturation: 100,
          lightness: 50
        });
      });
      it("works for (0, 255, 0)", function() {
        var hsl, rgb;
        rgb = {
          red: 0,
          green: 255,
          blue: 0
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 120,
          saturation: 100,
          lightness: 50
        });
      });
      it("works for (0, 255, 127)", function() {
        var hsl, rgb;
        rgb = {
          red: 0,
          green: 255,
          blue: 127
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 150,
          saturation: 100,
          lightness: 50
        });
      });
      it("works for (0, 255, 255)", function() {
        var hsl, rgb;
        rgb = {
          red: 0,
          green: 255,
          blue: 255
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 180,
          saturation: 100,
          lightness: 50
        });
      });
      it("works for (127, 0, 0)", function() {
        var hsl, rgb;
        rgb = {
          red: 127,
          green: 0,
          blue: 0
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: null,
          saturation: 100,
          lightness: 25
        });
      });
      it("works for (127, 0, 127)", function() {
        var hsl, rgb;
        rgb = {
          red: 127,
          green: 0,
          blue: 127
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 300,
          saturation: 100,
          lightness: 25
        });
      });
      it("works for (127, 0, 255)", function() {
        var hsl, rgb;
        rgb = {
          red: 127,
          green: 0,
          blue: 255
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 270,
          saturation: 100,
          lightness: 50
        });
      });
      it("works for (127, 127, 0)", function() {
        var hsl, rgb;
        rgb = {
          red: 127,
          green: 127,
          blue: 0
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 60,
          saturation: 100,
          lightness: 25
        });
      });
      it("works for (127, 127, 127)", function() {
        var hsl, rgb;
        rgb = {
          red: 127,
          green: 127,
          blue: 127
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: null,
          saturation: 0,
          lightness: 50
        });
      });
      it("works for (127, 127, 255)", function() {
        var hsl, rgb;
        rgb = {
          red: 127,
          green: 127,
          blue: 255
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 240,
          saturation: 100,
          lightness: 75
        });
      });
      it("works for (127, 255, 0)", function() {
        var hsl, rgb;
        rgb = {
          red: 127,
          green: 255,
          blue: 0
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 90,
          saturation: 100,
          lightness: 50
        });
      });
      it("works for (127, 255, 127)", function() {
        var hsl, rgb;
        rgb = {
          red: 127,
          green: 255,
          blue: 127
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 120,
          saturation: 100,
          lightness: 75
        });
      });
      it("works for (127, 255, 255)", function() {
        var hsl, rgb;
        rgb = {
          red: 127,
          green: 255,
          blue: 255
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 180,
          saturation: 100,
          lightness: 75
        });
      });
      it("works for (255, 0, 0)", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 0,
          blue: 0
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: null,
          saturation: 100,
          lightness: 50
        });
      });
      it("works for (255, 0, 127)", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 0,
          blue: 127
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 330,
          saturation: 100,
          lightness: 50
        });
      });
      it("works for (255, 0, 255)", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 0,
          blue: 255
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 300,
          saturation: 100,
          lightness: 50
        });
      });
      it("works for (255, 127, 0)", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 127,
          blue: 0
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 30,
          saturation: 100,
          lightness: 50
        });
      });
      it("works for (255, 127, 127)", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 127,
          blue: 127
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: null,
          saturation: 100,
          lightness: 75
        });
      });
      it("works for (255, 127, 255)", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 127,
          blue: 255
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 300,
          saturation: 100,
          lightness: 75
        });
      });
      it("works for (255, 255, 0)", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 255,
          blue: 0
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 60,
          saturation: 100,
          lightness: 50
        });
      });
      it("works for (255, 255, 127)", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 255,
          blue: 127
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 60,
          saturation: 100,
          lightness: 75
        });
      });
      return it("works for (255, 255, 255)", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 255,
          blue: 255
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: null,
          saturation: 100,
          lightness: 100
        });
      });
    });
    return describe(".hsl2rgb", function() {
      it("works for (0, 0, 0)", function() {
        var hsl, rgb;
        hsl = {
          hue: 0,
          saturation: 0,
          lightness: 0
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 0,
          green: 0,
          blue: 0
        });
      });
      it("works for (0, 0, 50)", function() {
        var hsl, rgb;
        hsl = {
          hue: 0,
          saturation: 0,
          lightness: 50
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 128,
          green: 128,
          blue: 128
        });
      });
      it("works for (0, 0, 100)", function() {
        var hsl, rgb;
        hsl = {
          hue: 0,
          saturation: 0,
          lightness: 100
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 255,
          blue: 255
        });
      });
      it("works for (0, 50, 0)", function() {
        var hsl, rgb;
        hsl = {
          hue: 0,
          saturation: 50,
          lightness: 0
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 0,
          green: 0,
          blue: 0
        });
      });
      it("works for (0, 50, 50)", function() {
        var hsl, rgb;
        hsl = {
          hue: 0,
          saturation: 50,
          lightness: 50
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 191,
          green: 64,
          blue: 64
        });
      });
      it("works for (0, 50, 100)", function() {
        var hsl, rgb;
        hsl = {
          hue: 0,
          saturation: 50,
          lightness: 100
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 255,
          blue: 255
        });
      });
      it("works for (0, 100, 0)", function() {
        var hsl, rgb;
        hsl = {
          hue: 0,
          saturation: 100,
          lightness: 0
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 0,
          green: 0,
          blue: 0
        });
      });
      it("works for (0, 100, 50)", function() {
        var hsl, rgb;
        hsl = {
          hue: 0,
          saturation: 100,
          lightness: 50
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 0,
          blue: 0
        });
      });
      it("works for (0, 100, 100)", function() {
        var hsl, rgb;
        hsl = {
          hue: 0,
          saturation: 100,
          lightness: 100
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 255,
          blue: 255
        });
      });
      it("works for (90, 0, 0)", function() {
        var hsl, rgb;
        hsl = {
          hue: 90,
          saturation: 0,
          lightness: 0
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 0,
          green: 0,
          blue: 0
        });
      });
      it("works for (90, 0, 50)", function() {
        var hsl, rgb;
        hsl = {
          hue: 90,
          saturation: 0,
          lightness: 50
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 128,
          green: 128,
          blue: 128
        });
      });
      it("works for (90, 0, 100)", function() {
        var hsl, rgb;
        hsl = {
          hue: 90,
          saturation: 0,
          lightness: 100
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 255,
          blue: 255
        });
      });
      it("works for (90, 50, 0)", function() {
        var hsl, rgb;
        hsl = {
          hue: 90,
          saturation: 50,
          lightness: 0
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 0,
          green: 0,
          blue: 0
        });
      });
      it("works for (90, 50, 50)", function() {
        var hsl, rgb;
        hsl = {
          hue: 90,
          saturation: 50,
          lightness: 50
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 128,
          green: 191,
          blue: 64
        });
      });
      it("works for (90, 50, 100)", function() {
        var hsl, rgb;
        hsl = {
          hue: 90,
          saturation: 50,
          lightness: 100
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 255,
          blue: 255
        });
      });
      it("works for (90, 100, 0)", function() {
        var hsl, rgb;
        hsl = {
          hue: 90,
          saturation: 100,
          lightness: 0
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 0,
          green: 0,
          blue: 0
        });
      });
      it("works for (90, 100, 50)", function() {
        var hsl, rgb;
        hsl = {
          hue: 90,
          saturation: 100,
          lightness: 50
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 128,
          green: 255,
          blue: 0
        });
      });
      it("works for (90, 100, 100)", function() {
        var hsl, rgb;
        hsl = {
          hue: 90,
          saturation: 100,
          lightness: 100
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 255,
          blue: 255
        });
      });
      it("works for (180, 0, 0)", function() {
        var hsl, rgb;
        hsl = {
          hue: 180,
          saturation: 0,
          lightness: 0
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 0,
          green: 0,
          blue: 0
        });
      });
      it("works for (180, 0, 50)", function() {
        var hsl, rgb;
        hsl = {
          hue: 180,
          saturation: 0,
          lightness: 50
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 128,
          green: 128,
          blue: 128
        });
      });
      it("works for (180, 0, 100)", function() {
        var hsl, rgb;
        hsl = {
          hue: 180,
          saturation: 0,
          lightness: 100
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 255,
          blue: 255
        });
      });
      it("works for (180, 100, 0)", function() {
        var hsl, rgb;
        hsl = {
          hue: 180,
          saturation: 100,
          lightness: 0
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 0,
          green: 0,
          blue: 0
        });
      });
      it("works for (180, 100, 50)", function() {
        var hsl, rgb;
        hsl = {
          hue: 180,
          saturation: 100,
          lightness: 50
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 0,
          green: 255,
          blue: 255
        });
      });
      it("works for (180, 100, 100)", function() {
        var hsl, rgb;
        hsl = {
          hue: 180,
          saturation: 100,
          lightness: 100
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 255,
          blue: 255
        });
      });
      it("works for (270, 0, 0)", function() {
        var hsl, rgb;
        hsl = {
          hue: 270,
          saturation: 0,
          lightness: 0
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 0,
          green: 0,
          blue: 0
        });
      });
      it("works for (270, 0, 50)", function() {
        var hsl, rgb;
        hsl = {
          hue: 270,
          saturation: 0,
          lightness: 50
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 128,
          green: 128,
          blue: 128
        });
      });
      it("works for (270, 0, 100)", function() {
        var hsl, rgb;
        hsl = {
          hue: 270,
          saturation: 0,
          lightness: 100
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 255,
          blue: 255
        });
      });
      it("works for (270, 50, 0)", function() {
        var hsl, rgb;
        hsl = {
          hue: 270,
          saturation: 50,
          lightness: 0
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 0,
          green: 0,
          blue: 0
        });
      });
      it("works for (270, 50, 50)", function() {
        var hsl, rgb;
        hsl = {
          hue: 270,
          saturation: 50,
          lightness: 50
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 127,
          green: 64,
          blue: 191
        });
      });
      it("works for (270, 50, 100)", function() {
        var hsl, rgb;
        hsl = {
          hue: 270,
          saturation: 50,
          lightness: 100
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 255,
          blue: 255
        });
      });
      it("works for (270, 100, 0)", function() {
        var hsl, rgb;
        hsl = {
          hue: 270,
          saturation: 100,
          lightness: 0
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 0,
          green: 0,
          blue: 0
        });
      });
      it("works for (270, 100, 50)", function() {
        var hsl, rgb;
        hsl = {
          hue: 270,
          saturation: 100,
          lightness: 50
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 127,
          green: 0,
          blue: 255
        });
      });
      return it("works for (270, 100, 100)", function() {
        var hsl, rgb;
        hsl = {
          hue: 270,
          saturation: 100,
          lightness: 100
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 255,
          blue: 255
        });
      });
    });
  });
}).call(this);
