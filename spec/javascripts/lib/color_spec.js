(function() {
  var Color;
  Color = SpriteEditor.Color;
  describe("Color", function() {
    describe(".new", function() {
      describe("an RGB color", function() {
        it("accepts red, green, and blue properties (defaulting alpha to 1)", function() {
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
      describe("an HSL color", function() {
        it("accepts hue, sat, and lum properties (defaulting alpha to 1)", function() {
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
    return describe(".hsl2rgb", function() {
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
  });
}).call(this);
