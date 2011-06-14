(function(window, $) {

var Color = {
  componentsByRepresentation: {
    rgb: ['red', 'green', 'blue'],
    hsl: ['hue', 'sat', 'lum']
  },
  correctHue: true,

  // Much of the code in the next three methods were stolen from <http://hslpicker.com>,
  // which in turn was adapted from the SASS source
  // which in turn was adapted from algorithms on <http://en.wikipedia.org/wiki/HSL_and_HSV>

  rgb2hsl: function(rgb) {
    var self = this;
    var hsl = {};

    var r = rgb.red   / 255;
    var g = rgb.green / 255;
    var b = rgb.blue  / 255;

    // Algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Conversion_from_RGB_to_HSL_or_HSV
    var max  = Math.max(r, g, b);
    var min  = Math.min(r, g, b);
    var diff = max - min;
    var sum  = min + max;

    var h;
    switch (max) {
      case min:
        // According to the spec, hue is undefined when min == max,
        // but for display purposes this isn't very convenient, so let's correct this by default
        h = self.correctHue ? 0 : null;
        break;
      case r:
        h = ((60 * (g - b) / diff) + 360) % 360;
        break;
      case g:
        h = (60 * (b - r) / diff) + 120;
        break;
      case b:
        h = (60 * (r - g) / diff) + 240;
        break;
    }

    var l = sum / 2;

    var s;
    if (l === 0) s = 0;
    else if (l === 1) s = 1;
    else if (l <= 0.5) s = diff / sum;
    else s = diff / (2 - sum);

    hsl.hue = h === null ? null : Math.round(h);
    hsl.sat = Math.round(s * 100);
    hsl.lum = Math.round(l * 100);

    return hsl;
  },

  hsl2rgb: function(hsl) {
    var self = this;
    var rgb = {};

    var h = (hsl.hue || 0) / 360;
        s = hsl.sat / 100;
        l = hsl.lum / 100;

    if (l <= 0.5) var q = l * (1 + s);
    else var q = l + s - (l * s);

    var p = 2 * l - q;
    var tr = h + (1 / 3);
    var tg = h;
    var tb = h - (1 / 3);

    // Algorithm from the CSS3 spec: http://www.w3.org/TR/css3-color/#hsl-color.
    rgb.red   = Math.round(self._hue2rgb(p, q, tr) * 255);
    rgb.green = Math.round(self._hue2rgb(p, q, tg) * 255);
    rgb.blue  = Math.round(self._hue2rgb(p, q, tb) * 255);

    return rgb;
  },

  _hue2rgb: function(p, q, h) {
    if (h < 0) h += 1;
    else if (h > 1) h -= 1;

    if ((h * 6) < 1) return p + (q - p) * h * 6;
    else if ((h * 2) < 1) return q;
    else if ((h * 3) < 2) return p + (q - p) * ((2 / 3) - h) * 6;
    else return p;
  }
};

//------------------------------------------------------------------------------

Color.RGB = function(red, green, blue, alpha) {
  var self = this;
  if (arguments.length == 1 && typeof arguments[0] == "object") {
    var color = arguments[0];
    $.v.each(Color.RGB.properties, function(prop) {
      self[prop] = color[prop];
    })
  } else {
    self.red = red;
    self.green = green;
    self.blue = blue;
    if (typeof alpha == "undefined" && (typeof red != "undefined" || typeof green != "undefined" || typeof blue != "undefined")) {
      self.alpha = 1;
    } else {
      self.alpha = alpha;
    }
  }
}

$.extend(Color.RGB, {
  properties: "red green blue alpha".split(" ")
});

$.extend(Color.RGB.prototype, {
  with: function(props) {
    var self = this;
    var clone = self.clone();
    $.v.each(Color.RGB.properties, function(prop) {
      if (prop in props) clone[prop] = props[prop];
    })
    return clone;
  },

  toRGB: function() {
    return this;
  },

  toHSL: function() {
    var self = this;
    if (self.isClear()) {
      return new Color.HSL();
    } else {
      var hsl = Color.rgb2hsl(self);
      return new Color.HSL(hsl.hue, hsl.sat, hsl.lum, self.alpha);
    }
  },

  isClear: function() {
    var self = this;
    return $.v.every(Color.RGB.properties, function(prop) { return typeof self[prop] == "undefined" });
  },

  clone: function() {
    var self = this;
    var clone = new Color.RGB(self);
    return clone;
  },

  toString: function() {
    var self = this;
    var values = $.v.map(Color.RGB.properties, function(prop) { return self[prop] || 0 });
    return 'rgba(' + values.join(", ") + ')';
  },

  eq: function(other) {
    var self = this;
    return $.v.every(Color.RGB.properties, function(prop) { return self[prop] == other[prop] });
  }
})

//------------------------------------------------------------------------------

Color.HSL = function(hue, sat, lum, alpha) {
  var self = this;
  if (arguments.length == 1 && typeof arguments[0] == "object") {
    var color = arguments[0];
    $.v.each(Color.HSL.properties, function(prop) {
      self[prop] = color[prop];
    })
  } else {
    self.hue = hue;
    self.sat = sat;
    self.lum = lum;
    if (typeof alpha == "undefined" && (typeof hue != "undefined" || typeof sat != "undefined" || typeof lum != "undefined")) {
      self.alpha = 1;
    } else {
      self.alpha = alpha;
    }
  }
}

$.extend(Color.HSL, {
  properties: "hue sat lum alpha".split(" ")
});

$.extend(Color.HSL.prototype, {
  with: function(props) {
    var self = this;
    var clone = self.clone();
    $.v.each(Color.HSL.properties, function(prop) {
      if (prop in props) clone[prop] = props[prop];
    })
    return clone;
  },

  toRGB: function() {
    var self = this;
    if (self.isClear()) {
      return new Color.RGB()
    } else {
      var rgb = Color.hsl2rgb(self);
      return new Color.RGB(rgb.red, rgb.green, rgb.blue, self.alpha);
    }
  },

  toHSL: function() {
    return this;
  },

  isClear: function() {
    var self = this;
    return $.v.every(Color.HSL.properties, function(prop) { return typeof self[prop] == "undefined" });
  },

  clone: function() {
    var self = this;
    var clone = new Color.HSL(self);
    return clone;
  },

  toString: function() {
    var self = this;
    var values = $.v.map(Color.HSL.properties, function(prop) { return self[prop] || 0 });
    return 'hsla('+ values.join(", ") + ')';
  },

  eq: function(other) {
    var self = this;
    return $.v.every(Color.HSL.properties, function(prop) { return self[prop] == other[prop] });
  }
})

//------------------------------------------------------------------------------

$.export('SpriteEditor.Color', Color);

})(window, window.ender);