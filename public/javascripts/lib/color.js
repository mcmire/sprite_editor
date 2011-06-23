(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $["export"]("SpriteEditor.Color", function(SpriteEditor) {
    var Color;
    return Color = (function() {
      Color.componentsByType = {
        rgb: "red green blue".split(" "),
        hsl: "hue sat lum".split(" ")
      };
      Color.allComponents = Color.componentsByType.rgb.concat(Color.componentsByType.hsl);
      Color.propertiesByType = {
        rgb: Color.componentsByType.rgb.concat(["alpha"]),
        hsl: Color.componentsByType.hsl.concat(["alpha"])
      };
      Color.allProperties = Color.allComponents.concat(["alpha"]);
      Color.rgb2hsl = function(rgb) {
        var b, correctHue, diff, g, h, hsl, l, max, min, r, s, sum, _ref;
        hsl = {};
        correctHue = (_ref = rgb.correctHue) != null ? _ref : true;
        r = rgb.red / 255;
        g = rgb.green / 255;
        b = rgb.blue / 255;
        max = Math.max(r, g, b);
        min = Math.min(r, g, b);
        diff = max - min;
        sum = min + max;
        switch (max) {
          case min:
            if (correctHue) {
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
        hsl.hue = (h != null ? Math.round(h) : null);
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
      function Color(args) {
        var prop;
        if (args != null) {
          if (args instanceof Color || (args._s != null)) {
            for (prop in args) {
              if (prop !== "_s") {
                this[prop] = args[prop];
              }
            }
          } else {
            this.set(args, function(type) {
              var components;
              components = Color.componentsByType[type];
              if (!$.v.every(components, function(prop) {
                return args[prop] != null;
              })) {
                throw "An " + (type.toUpperCase()) + " color requires " + (components.slice(0, 2).join(", ")) + ", and " + components[2] + " properties!";
              }
            });
          }
        }
        if (!(this.alpha != null) && this.isFilled()) {
          this.alpha = 1;
        }
        this.correctHue = true;
      }
      Color.prototype.set = function(args, onDetectType) {
        var prop, type, _i, _len, _ref;
        if (type = this._detectType(args)) {
          if (typeof onDetectType === "function") {
            onDetectType(type);
          }
          _ref = Color.componentsByType[type];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            prop = _ref[_i];
            if (args[prop] != null) {
              this[prop] = args[prop];
            }
          }
          if (type === "rgb") {
            this._recalculateHSL();
          } else {
            this._recalculateRGB();
          }
        }
        if (args.alpha != null) {
          return this.alpha = args.alpha;
        }
      };
      Color.prototype["with"] = function(args) {
        var clone;
        clone = this.clone();
        clone.set(args);
        return clone;
      };
      Color.prototype.isFilled = function() {
        var self;
        self = this;
        return $.v.some(Color.allComponents, function(prop) {
          return self[prop] != null;
        });
      };
      Color.prototype.isClear = function() {
        return !this.isFilled();
      };
      Color.prototype.clone = function() {
        return new Color(this);
      };
      Color.prototype.toJSON = function() {
        return JSON.stringify({
          _s: true,
          red: this.red,
          green: this.green,
          blue: this.blue,
          hue: this.hue,
          sat: this.sat,
          lum: this.lum,
          alpha: this.alpha
        });
      };
      Color.prototype.toRGBAString = function() {
        var prop, values;
        values = (function() {
          var _i, _len, _ref, _ref2, _results;
          _ref = Color.propertiesByType.rgb;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            prop = _ref[_i];
            _results.push((_ref2 = this[prop]) != null ? _ref2 : "null");
          }
          return _results;
        }).call(this);
        return "rgba(" + values.join(", ") + ")";
      };
      Color.prototype.toHSLAString = function() {
        var prop, values;
        values = (function() {
          var _i, _len, _ref, _ref2, _results;
          _ref = Color.propertiesByType.hsl;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            prop = _ref[_i];
            _results.push((_ref2 = this[prop]) != null ? _ref2 : "null");
          }
          return _results;
        }).call(this);
        return "hsla(" + values.join(", ") + ")";
      };
      Color.prototype.inspect = function() {
        return "{rgba: " + (this.toRGBAString()) + ", hsla: " + (this.toHSLAString()) + "}";
      };
      Color.prototype.eq = function(other) {
        var self;
        self = this;
        return $.v.every(Color.allProperties, __bind(function(prop) {
          return self[prop] === other[prop];
        }, this));
      };
      Color.prototype._recalculateRGB = function() {
        return $.extend(this, Color.hsl2rgb(this));
      };
      Color.prototype._recalculateHSL = function() {
        return $.extend(this, Color.rgb2hsl(this));
      };
      Color.prototype._detectType = function(args, sig) {
        var count;
        count = 0;
        if ($.v.some(Color.componentsByType.rgb, function(prop) {
          return args[prop] != null;
        })) {
          count += 1;
        }
        if ($.v.some(Color.componentsByType.hsl, function(prop) {
          return args[prop] != null;
        })) {
          count += 2;
        }
        switch (count) {
          case 3:
            throw "To set a Color, you must pass either RGB properties or HSL properties, but not both!";
            break;
          case 2:
            return "hsl";
          case 1:
            return "rgb";
          default:
            return null;
        }
      };
      return Color;
    })();
  });
}).call(this);
