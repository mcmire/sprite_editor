(function() {
  var Color;
  Color = SpriteEditor.Color;
  describe("Color", function() {
    describe(".new", function() {
      describe("given properties of an RGB color", function() {
        it("sets red, blue, and green (defaulting alpha to 1)", function() {
          var color;
          color = new Color({
            red: 90,
            green: 188,
            blue: 73
          });
          return expect(color).toContainObject({
            red: 90,
            green: 188,
            blue: 73,
            alpha: 1
          });
        });
        it("calculates the HSL color based on the RGB color", function() {
          var color;
          color = new Color({
            red: 90,
            green: 188,
            blue: 73
          });
          return expect(color).toContainObject({
            hue: 111,
            sat: 46,
            lum: 51
          });
        });
        it("accepts an alpha property too", function() {
          var color;
          color = new Color({
            red: 90,
            green: 188,
            blue: 73,
            alpha: 0.5
          });
          return expect(color).toContainObject({
            red: 90,
            green: 188,
            blue: 73,
            alpha: 0.5
          });
        });
        return it("bails if any of red, blue, or green are left out", function() {
          var msg;
          msg = "An RGB color requires red, green, and blue properties!";
          expect(function() {
            return new Color({
              red: 90
            });
          }).toThrow(msg);
          expect(function() {
            return new Color({
              green: 188
            });
          }).toThrow(msg);
          expect(function() {
            return new Color({
              blue: 73
            });
          }).toThrow(msg);
          expect(function() {
            return new Color({
              red: 90,
              green: 188
            });
          }).toThrow(msg);
          expect(function() {
            return new Color({
              green: 90,
              blue: 188
            });
          }).toThrow(msg);
          return expect(function() {
            return new Color({
              red: 90,
              blue: 188
            });
          }).toThrow(msg);
        });
      });
      describe("given properties of an HSL color", function() {
        it("sets hue, sat, and lum (defaulting alpha to 1)", function() {
          var color;
          color = new Color({
            hue: 111,
            sat: 46,
            lum: 51
          });
          return expect(color).toContainObject({
            hue: 111,
            sat: 46,
            lum: 51,
            alpha: 1
          });
        });
        it("calculates the RGB color based on the HSL color", function() {
          var color;
          color = new Color({
            hue: 111,
            sat: 46,
            lum: 51
          });
          return expect(color).toContainObject({
            red: 90,
            green: 188,
            blue: 73
          });
        });
        it("accepts an alpha property too", function() {
          var color;
          color = new Color({
            hue: 111,
            sat: 46,
            lum: 51,
            alpha: 0.5
          });
          return expect(color).toContainObject({
            hue: 111,
            sat: 46,
            lum: 51,
            alpha: 0.5
          });
        });
        return it("bails if any of hue, sat, or lum are left out", function() {
          var msg;
          msg = "An HSL color requires hue, sat, and lum properties!";
          expect(function() {
            return new Color({
              hue: 111
            });
          }).toThrow(msg);
          expect(function() {
            return new Color({
              sat: 46
            });
          }).toThrow(msg);
          expect(function() {
            return new Color({
              lum: 51
            });
          }).toThrow(msg);
          expect(function() {
            return new Color({
              hue: 111,
              sat: 46
            });
          }).toThrow(msg);
          expect(function() {
            return new Color({
              sat: 46,
              lum: 51
            });
          }).toThrow(msg);
          return expect(function() {
            return new Color({
              hue: 111,
              lum: 51
            });
          }).toThrow(msg);
        });
      });
      it("simply copies properties from an existing Color object", function() {
        var color, color2;
        color = new Color({
          red: 90,
          green: 188,
          blue: 73
        });
        color2 = new Color(color);
        return expect(color2).toContainObject({
          red: 90,
          green: 188,
          blue: 73
        });
      });
      it("simply copies properties from the given object if it came from toJSON()", function() {
        var color;
        color = new Color({
          _s: true,
          red: 90,
          green: 188,
          blue: 73,
          hue: 111,
          sat: 46,
          lum: 51,
          alpha: 0.5
        });
        expect(color).toContainObject({
          red: 90,
          green: 188,
          blue: 73,
          hue: 111,
          sat: 46,
          lum: 51,
          alpha: 0.5
        });
        return expect(color._s).not.toBeDefined();
      });
      it("sets no properties (creating a clear color) if no arguments are given", function() {
        var color;
        color = new Color();
        expect(color.red).not.toBeDefined;
        expect(color.green).not.toBeDefined;
        expect(color.blue).not.toBeDefined;
        expect(color.hue).not.toBeDefined;
        expect(color.sat).not.toBeDefined;
        expect(color.lum).not.toBeDefined;
        return expect(color.alpha).not.toBeDefined;
      });
      return it("bails if RGB and HSL properties are mixed", function() {
        var msg;
        msg = "To set a Color, you must pass either RGB properties or HSL properties, but not both!";
        expect(function() {
          return new Color({
            red: 90,
            hue: 111
          });
        }).toThrow(msg);
        expect(function() {
          return new Color({
            blue: 73,
            green: 90,
            sat: 46,
            lum: 51
          });
        }).toThrow(msg);
        return expect(function() {
          return new Color({
            red: 90,
            green: 188,
            blue: 73,
            hue: 111,
            sat: 46,
            lum: 51
          });
        }).toThrow(msg);
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
          hue: 0,
          sat: 0,
          lum: 0
        });
      });
      it("returns a hue of null of (0, 0, 0) if correctHue: false passed", function() {
        var hsl, rgb;
        rgb = {
          red: 0,
          green: 0,
          blue: 0,
          correctHue: false
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: null,
          sat: 0,
          lum: 0
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
          sat: 100,
          lum: 25
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 25
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
          sat: 100,
          lum: 25
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 50
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
          hue: 0,
          sat: 100,
          lum: 25
        });
      });
      it("still returns a hue of 0 for (127, 0, 0) if correctHue: false passed", function() {
        var hsl, rgb;
        rgb = {
          red: 127,
          green: 0,
          blue: 0,
          correctHue: false
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 0,
          sat: 100,
          lum: 25
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
          sat: 100,
          lum: 25
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 25
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
          hue: 0,
          sat: 0,
          lum: 50
        });
      });
      it("returns a hue of null for (127, 127, 127) if correctHue: false passed", function() {
        var hsl, rgb;
        rgb = {
          red: 127,
          green: 127,
          blue: 127,
          correctHue: false
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: null,
          sat: 0,
          lum: 50
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
          sat: 100,
          lum: 75
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 75
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
          sat: 100,
          lum: 75
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
          hue: 0,
          sat: 100,
          lum: 50
        });
      });
      it("still returns a hue of 0 for (255, 0, 0) if correctHue: false was passed", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 0,
          blue: 0,
          correctHue: false
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 0,
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 50
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
          hue: 0,
          sat: 100,
          lum: 75
        });
      });
      it("still returns a hue of 0 for (255, 127, 127) if correctHue: false was passed", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 127,
          blue: 127,
          correctHue: false
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 0,
          sat: 100,
          lum: 75
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
          sat: 100,
          lum: 75
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 75
        });
      });
      it("works for (255, 255, 255)", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 255,
          blue: 255
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: 0,
          sat: 100,
          lum: 100
        });
      });
      return it("returns a hue of null for (255, 255, 255) if correctHue: false was passed", function() {
        var hsl, rgb;
        rgb = {
          red: 255,
          green: 255,
          blue: 255,
          correctHue: false
        };
        hsl = Color.rgb2hsl(rgb);
        return expect(hsl).toEqual({
          hue: null,
          sat: 100,
          lum: 100
        });
      });
    });
    describe(".hsl2rgb", function() {
      it("works for (0, 0, 0)", function() {
        var hsl, rgb;
        hsl = {
          hue: 0,
          sat: 0,
          lum: 0
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
          sat: 0,
          lum: 50
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
          sat: 0,
          lum: 100
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
          sat: 50,
          lum: 0
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
          sat: 50,
          lum: 50
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
          sat: 50,
          lum: 100
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
          sat: 100,
          lum: 0
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 100
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
          sat: 0,
          lum: 0
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
          sat: 0,
          lum: 50
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
          sat: 0,
          lum: 100
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
          sat: 50,
          lum: 0
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
          sat: 50,
          lum: 50
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
          sat: 50,
          lum: 100
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
          sat: 100,
          lum: 0
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 100
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
          sat: 0,
          lum: 0
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
          sat: 0,
          lum: 50
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
          sat: 0,
          lum: 100
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
          sat: 100,
          lum: 0
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 100
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
          sat: 0,
          lum: 0
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
          sat: 0,
          lum: 50
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
          sat: 0,
          lum: 100
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
          sat: 50,
          lum: 0
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
          sat: 50,
          lum: 50
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
          sat: 50,
          lum: 100
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
          sat: 100,
          lum: 0
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
          sat: 100,
          lum: 50
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
          sat: 100,
          lum: 100
        };
        rgb = Color.hsl2rgb(hsl);
        return expect(rgb).toEqual({
          red: 255,
          green: 255,
          blue: 255
        });
      });
    });
    describe('#set', function() {
      describe("given properties of an RGB color", function() {
        var color;
        color = null;
        beforeEach(function() {
          return color = new Color({
            red: 90,
            green: 188,
            blue: 73
          });
        });
        it("allows setting red, green, and blue properties", function() {
          color.set({
            green: 72,
            blue: 190
          });
          return expect(color).toContainObject({
            red: 90,
            green: 72,
            blue: 190
          });
        });
        it("does not allow clearing existing properties", function() {
          color.set({
            green: null,
            blue: 190
          });
          return expect(color).toContainObject({
            red: 90,
            green: 188,
            blue: 190
          });
        });
        it("accepts an alpha property too", function() {
          color.set({
            green: 72,
            alpha: 0.5
          });
          return expect(color).toContainObject({
            red: 90,
            green: 72,
            blue: 73,
            alpha: 0.5
          });
        });
        it("does not allow clearing the alpha property", function() {
          color.set({
            green: 72,
            alpha: null
          });
          return expect(color).toContainObject({
            red: 90,
            green: 72,
            blue: 73,
            alpha: 1
          });
        });
        return it("recalculates the HSL color based on the RGB color", function() {
          color.set({
            green: 72,
            blue: 190
          });
          return expect(color).toContainObject({
            hue: 249,
            sat: 48,
            lum: 51
          });
        });
      });
      describe("given properties of an HSL color", function() {
        var color;
        color = null;
        beforeEach(function() {
          return color = new Color({
            hue: 111,
            sat: 46,
            lum: 51
          });
        });
        it("allows setting hue, sat, and lum properties", function() {
          color.set({
            hue: 80,
            lum: 23
          });
          return expect(color).toContainObject({
            hue: 80,
            sat: 46,
            lum: 23
          });
        });
        it("does not allow clearing existing properties", function() {
          color.set({
            hue: null,
            lum: 23
          });
          return expect(color).toContainObject({
            hue: 111,
            sat: 46,
            lum: 23
          });
        });
        it("accepts an alpha property too", function() {
          color.set({
            hue: 80,
            alpha: 0.5
          });
          return expect(color).toContainObject({
            hue: 80,
            sat: 46,
            lum: 51,
            alpha: 0.5
          });
        });
        it("does not allow clearing the alpha property", function() {
          color.set({
            hue: 80,
            alpha: null
          });
          return expect(color).toContainObject({
            hue: 80,
            sat: 46,
            lum: 51,
            alpha: 1
          });
        });
        return it("recalculates the RGB color based on the HSL color", function() {
          color.set({
            hue: 80,
            lum: 23
          });
          return expect(color).toContainObject({
            red: 68,
            green: 86,
            blue: 32
          });
        });
      });
      return it("bails if RGB and HSL properties are mixed", function() {
        var color, msg;
        msg = "To set a Color, you must pass either RGB properties or HSL properties, but not both!";
        color = new Color();
        expect(function() {
          return color.set({
            red: 90,
            hue: 111
          });
        }).toThrow(msg);
        expect(function() {
          return color.set({
            blue: 73,
            green: 90,
            sat: 46,
            lum: 51
          });
        }).toThrow(msg);
        return expect(function() {
          return color.set({
            red: 90,
            green: 188,
            blue: 73,
            hue: 111,
            sat: 46,
            lum: 51
          });
        }).toThrow(msg);
      });
    });
    describe('#with', function() {
      var color;
      color = null;
      beforeEach(function() {
        return color = new Color({
          red: 90,
          green: 188,
          blue: 73
        });
      });
      it("returns a clone of the current Color", function() {
        var color2;
        color2 = color["with"]({
          red: 90
        });
        return expect(color2).not.toBe(color);
      });
      it("sets the given properties on the clone", function() {
        var color2;
        color2 = color["with"]({
          green: 29
        });
        return expect(color2.green).toEqual(29);
      });
      return it("doesn't allow RGB and HSL properties to be mixed", function() {
        var msg;
        msg = "To set a Color, you must pass either RGB properties or HSL properties, but not both!";
        return expect(function() {
          return color["with"]({
            green: 29,
            hue: 111
          });
        }).toThrow(msg);
      });
    });
    describe('#isFilled', function() {
      it("returns true if any of the color properties are set", function() {
        var color;
        color = new Color();
        color.red = 90;
        return expect(color.isFilled()).toBeTruthy();
      });
      it("returns false if none of the color properties are set", function() {
        var color;
        color = new Color();
        return expect(color.isFilled()).toBeFalsy();
      });
      return it("doesn't consider the alpha property in determining filledness", function() {
        var color;
        color = new Color();
        color.alpha = 0.4;
        return expect(color.isFilled()).toBeFalsy();
      });
    });
    describe('#isClear', function() {
      it("returns false if any of the color properties are set", function() {
        var color;
        color = new Color();
        color.red = 90;
        return expect(color.isClear()).toBeFalsy();
      });
      it("returns true if none of the color properties are set", function() {
        var color;
        color = new Color();
        return expect(color.isClear()).toBeTruthy();
      });
      return it("doesn't consider the alpha property in determining clearness", function() {
        var color;
        color = new Color();
        color.alpha = 0.4;
        return expect(color.isClear()).toBeTruthy();
      });
    });
    describe('#clone', function() {
      return it("returns a copy of the current Color", function() {
        var color, color2;
        color = new Color();
        color2 = color.clone();
        return expect(color2).not.toBe(color);
      });
    });
    describe('#toJSON', function() {
      return it("excludes the functions from the object representation", function() {
        var color;
        color = new Color({
          red: 90,
          green: 188,
          blue: 73,
          alpha: 0.4
        });
        return expect(color.toJSON()).toEqual('{"_s":true,"red":90,"green":188,"blue":73,"hue":111,"sat":46,"lum":51,"alpha":0.4}');
      });
    });
    describe('#toRGBAString', function() {
      return it("returns a CSS-compatible string representing the RGBA color", function() {
        var color;
        color = new Color({
          red: 90,
          green: 188,
          blue: 73,
          alpha: 0.4
        });
        return expect(color.toRGBAString()).toEqual('rgba(90, 188, 73, 0.4)');
      });
    });
    describe('#toHSLAString', function() {
      return it("returns a CSS-compatible string represnting the HSLA color", function() {
        var color;
        color = new Color({
          hue: 111,
          sat: 46,
          lum: 51,
          alpha: 0.4
        });
        return expect(color.toHSLAString()).toEqual('hsla(111, 46, 51, 0.4)');
      });
    });
    describe('#inspect', function() {
      return it("returns a debug-friendly representation of the color broken down by type", function() {
        var color;
        color = new Color({
          red: 90,
          green: 188,
          blue: 73,
          alpha: 0.4
        });
        return expect(color.inspect()).toEqual("{rgba: rgba(90, 188, 73, 0.4), hsla: hsla(111, 46, 51, 0.4)}");
      });
    });
    return describe('#eq', function() {
      it("returns true if all the properties of the given Color match this Color", function() {
        var color, color2;
        color = new Color({
          red: 90,
          green: 188,
          blue: 73,
          alpha: 0.4
        });
        color2 = new Color({
          red: 90,
          green: 188,
          blue: 73,
          alpha: 0.4
        });
        return expect(color.eq(color2)).toBeTruthy();
      });
      it("also happens to work if given a straight object", function() {
        var color, color2;
        color = new Color({
          red: 90,
          green: 188,
          blue: 73,
          alpha: 0.4
        });
        color2 = {
          red: 90,
          green: 188,
          blue: 73,
          hue: 111,
          sat: 46,
          lum: 51,
          alpha: 0.4
        };
        return expect(color.eq(color2)).toBeTruthy();
      });
      return it("returns false if not all the properties of the given Color match this Color", function() {
        var color, color2;
        color = new Color({
          red: 90,
          green: 188,
          blue: 73,
          alpha: 0.4
        });
        color2 = new Color({
          red: 90,
          green: 188,
          blue: 73
        });
        expect(color.eq(color2)).toBeFalsy();
        color = new Color({
          red: 90,
          green: 188,
          blue: 73,
          alpha: 0.4
        });
        color2 = new Color({
          red: 90,
          green: 188,
          blue: 72,
          alpha: 0.4
        });
        return expect(color.eq(color2)).toBeFalsy();
      });
    });
  });
}).call(this);
