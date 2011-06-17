(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $["export"]("SpriteEditor.Color", function(SpriteEditor) {
    var Color;
    Color = (function() {
      function Color() {}
      Color.componentsByRepresentation = {
        rgb: ["red", "green", "blue"],
        hsl: ["hue", "sat", "lum"]
      };
      Color.correctHue = true;
      Color.rgb2hsl = function(rgb) {
        var b, diff, g, h, hsl, l, max, min, r, s, sum;
        hsl = {};
        r = rgb.red / 255;
        g = rgb.green / 255;
        b = rgb.blue / 255;
        max = Math.max(r, g, b);
        min = Math.min(r, g, b);
        diff = max - min;
        sum = min + max;
        switch (max) {
          case min:
            if (this.correctHue) {
              h = 0;
            }
            break;
          case r:
            h = ((60 * (g - b) / diff) + 360) % 360;
            break;
          case g:
            h = (60 * (b - r) / diff) + 120;
            break;
          case b:
            h = (60 * (r - g) / diff) + 240;
        }
        l = sum / 2;
        if (l === 0) {
          s = 0;
        } else if (l === 1) {
          s = 1;
        } else if (l <= 0.5) {
          s = diff / sum;
        } else {
          s = diff / (2 - sum);
        }
        if (h != null) {
          hsl.hue = Math.round(h);
        }
        hsl.sat = Math.round(s * 100);
        hsl.lum = Math.round(l * 100);
        return hsl;
      };
      Color.hsl2rgb = function(hsl) {
        var h, l, p, q, rgb, s, tb, tg, tr;
        rgb = {};
        h = (hsl.hue || 0) / 360;
        s = hsl.sat / 100;
        l = hsl.lum / 100;
        if (l <= 0.5) {
          q = l * (1 + s);
        } else {
          q = l + s - (l * s);
        }
        p = 2 * l - q;
        tr = h + (1 / 3);
        tg = h;
        tb = h - (1 / 3);
        rgb.red = Math.round(this._hue2rgb(p, q, tr) * 255);
        rgb.green = Math.round(this._hue2rgb(p, q, tg) * 255);
        rgb.blue = Math.round(this._hue2rgb(p, q, tb) * 255);
        return rgb;
      };
      Color._hue2rgb = function(p, q, h) {
        if (h < 0) {
          h += 1;
        } else if (h > 1) {
          h -= 1;
        }
        if ((h * 6) < 1) {
          return p + (q - p) * h * 6;
        }
        if ((h * 2) < 1) {
          return q;
        }
        if ((h * 3) < 2) {
          return p + (q - p) * ((2 / 3) - h) * 6;
        }
        return p;
      };
      return Color;
    })();
    Color.RGB = (function() {
      RGB.properties = "red green blue alpha".split(" ");
      function RGB(red, green, blue, alpha) {
        var color, prop, _i, _len, _ref;
        if (arguments.length === 1 && $.v.is.obj(arguments[0])) {
          color = arguments[0];
          _ref = Color.RGB.properties;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            prop = _ref[_i];
            this[prop] = color[prop];
          }
        } else {
          this.red = red;
          this.green = green;
          this.blue = blue;
          if (!(alpha != null) && ((red != null) || (green != null) || (blue != null))) {
            this.alpha = 1;
          } else {
            this.alpha = alpha;
          }
        }
      }
      RGB.prototype["with"] = function(props) {
        var clone, prop, _i, _len, _ref;
        clone = this.clone();
        _ref = Color.RGB.properties;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          prop = _ref[_i];
          if (prop in props) {
            clone[prop] = props[prop];
          }
        }
        return clone;
      };
      RGB.prototype.toRGB = function() {
        return this;
      };
      RGB.prototype.toHSL = function() {
        var hsl;
        if (this.isClear()) {
          return new Color.HSL();
        } else {
          hsl = Color.rgb2hsl(this);
          return new Color.HSL(hsl.hue, hsl.sat, hsl.lum, this.alpha);
        }
      };
      RGB.prototype.isClear = function() {
        var self;
        self = this;
        return $.v.every(Color.RGB.properties, function(prop) {
          return typeof self[prop] === "undefined";
        });
      };
      RGB.prototype.clone = function() {
        return new Color.RGB(this);
      };
      RGB.prototype.toString = function() {
        var prop, values;
        values = (function() {
          var _i, _len, _ref, _results;
          _ref = Color.RGB.properties;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            prop = _ref[_i];
            _results.push(this[prop] || 0);
          }
          return _results;
        }).call(this);
        return "rgba(" + values.join(", ") + ")";
      };
      RGB.prototype.eq = function(other) {
        return $.v.every(Color.RGB.properties, __bind(function(prop) {
          return this[prop] === other[prop];
        }, this));
      };
      return RGB;
    })();
    Color.HSL = (function() {
      HSL.properties = "hue sat lum alpha".split(" ");
      function HSL(hue, sat, lum, alpha) {
        var color, prop, _i, _len, _ref;
        if (arguments.length === 1 && $.v.is.obj(arguments[0])) {
          color = arguments[0];
          _ref = Color.HSL.properties;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            prop = _ref[_i];
            this[prop] = color[prop];
          }
        } else {
          this.hue = hue;
          this.sat = sat;
          this.lum = lum;
          if (!(alpha != null) && ((typeof red !== "undefined" && red !== null) || (typeof green !== "undefined" && green !== null) || (typeof blue !== "undefined" && blue !== null))) {
            this.alpha = 1;
          } else {
            this.alpha = alpha;
          }
        }
      }
      HSL.prototype["with"] = function(props) {
        var clone, prop, _i, _len, _ref;
        clone = this.clone();
        _ref = Color.HSL.properties;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          prop = _ref[_i];
          if (prop in props) {
            clone[prop] = props[prop];
          }
        }
        return clone;
      };
      HSL.prototype.toRGB = function() {
        var rgb;
        if (this.isClear()) {
          return new Color.RGB();
        } else {
          rgb = Color.hsl2rgb(this);
          return new Color.RGB(rgb.red, rgb.green, rgb.blue, this.alpha);
        }
      };
      HSL.prototype.toHSL = function() {
        return this;
      };
      HSL.prototype.isClear = function() {
        var self;
        self = this;
        return $.v.every(Color.HSL.properties, function(prop) {
          return typeof self[prop] === "undefined";
        });
      };
      HSL.prototype.clone = function() {
        return new Color.HSL(this);
      };
      HSL.prototype.toString = function() {
        var prop, values;
        values = (function() {
          var _i, _len, _ref, _results;
          _ref = Color.HSL.properties;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            prop = _ref[_i];
            _results.push(this[prop] || 0);
          }
          return _results;
        }).call(this);
        return "hsla(" + values.join(", ") + ")";
      };
      HSL.prototype.eq = function(other) {
        return $.v.every(Color.HSL.properties, __bind(function(prop) {
          return this[prop] === other[prop];
        }, this));
      };
      return HSL;
    })();
    return Color;
  });
}).call(this);
