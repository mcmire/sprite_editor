(function(window, document, $, undefined) {

  var ColorPickerBox = {
    hueSatCanvasSize: {width: 265, height: 300},
    lightnessCanvasSize: {width: 25, height: 300},
    //currentColor: Color.fromRGB(172, 85, 255),
    currentColor: Color.fromRGB(255, 0, 0),

    $container: null,
    hueSatCanvas: null,
    lightnessCanvas: null,
    colorFields: {},

    init: function(options) {
      var self = this;
      self.options = options;

      self.$container = $('<div class="square_color_picker dialog" />').hide();

      self._addHueSatDiv();
      self._addLightnessDiv();
      self._addColorFields();
      self._addColorSample();
      self._addCloseButton();

      return self;
    },

    open: function(color) {
      var self = this;

      if (self.options.open) self.options.open.call(self);

      self.$container.show();
      self.$container.center();

      self.currentColor = color;
      self._drawLightnessCanvas();
      self._setColorFields();
      self._positionHueSatSelectorFromColor();
      self._positionLightnessSelectorFromColor();
      self._setColorSample();

      self._addEvents();
    },

    close: function() {
      var self = this;
      self.$container.hide();
      self._removeEvents();
      if (self.options.close) self.options.close.call(self);
    },

    _addHueSatDiv: function() {
      var self = this;

      var $div = self.$hueSatDiv = $('<div class="hue_sat_div" />');
      $div.css({
        width: self.hueSatCanvasSize.width,
        height: self.hueSatCanvasSize.height
      });
      self.$container.append($div);

      self._addHueSatCanvas();
      self._addHueSatSelectorDiv();
    },

    _addHueSatCanvas: function() {
      var self = this;
      self.hueSatCanvas = Canvas.create(self.hueSatCanvasSize.width, self.hueSatCanvasSize.height, function(c) {
        var imageData = c.ctx.createImageData(c.width, c.height);
        var color;
        // TODO: Use a gradient for this instead of manually filling in pixels
        for (var y=0; y<c.height; y++) {
          for (var x=0; x<c.width; x++) {
            // x = 0..width  -> h = 0..360
            // y = 0..height -> s = 100..0
            var h = Math.round(x * (360 / c.width));
            var s = Math.round(y * (-100 / c.height) + 100);
            color = self.currentColor.withHSL({hue: h, saturation: s});
            imageData.setPixel(x, y, color.red, color.green, color.blue, 255);
          }
        }
        c.ctx.putImageData(imageData, 0, 0);
      })
      self.hueSatCanvas.$element.addClass("hue_sat_canvas");
      self.$hueSatDiv.append(self.hueSatCanvas.$element);
    },

    _addHueSatSelectorDiv: function() {
      var self = this;
      self.$hueSatSelectorDiv = $('<div class="hue_sat_selector" />');
      self.$hueSatDiv.append(self.$hueSatSelectorDiv);
    },

    _addLightnessDiv: function() {
      var self = this;
      self.$lightnessDiv = $('<div class="lightness_div" />')
      self.$lightnessDiv.css({
        width: self.lightnessCanvasSize.width + 11,
        height: self.lightnessCanvasSize.height
      })
      self.$container.append(self.$lightnessDiv);

      self._addLightnessCanvas();
    },

    _addLightnessCanvas: function() {
      var self = this;
      self.lightnessCanvas = Canvas.create(self.lightnessCanvasSize.width, self.lightnessCanvasSize.height);
      self.lightnessCanvas.$element.addClass("lightness_canvas");
      self.$lightnessDiv.append(self.lightnessCanvas.$element);
    },

    _drawLightnessCanvas: function() {
      var self = this;
      var c = self.lightnessCanvas;
      var imageData = c.ctx.createImageData(c.width, c.height);
      var color;
      // TODO: Use a gradient for this instead of manually filling in pixels
      for (var y=0; y<c.height; y++) {
        // y = 0..height -> l = 100..0
        var l = Math.round((-100 / c.height) * y + 100);
        color = self.currentColor.withHSL({lightness: l});
        for (var x=0; x<c.width; x++) {
          imageData.setPixel(x, y, color.red, color.green, color.blue, 255);
        }
      }
      c.ctx.putImageData(imageData, 0, 0);
    },

    _addColorFields: function() {
      var self = this;
      self.$colorFieldsDiv = $('<div class="color_fields" />');
      $.v.each(Color.components, function(repName, rep) {
        var $repDiv = $('<div class="'+repName+'_fields" />');
        $.v.each(rep, function(cpt) {
          var $colorSpan = $('<span />');
          var $colorField = $('<input type="text" size="3" />')
          self.colorFields[cpt] = $colorField;
          $colorSpan.html(cpt[0].toUpperCase() + ": ").append($colorField);
          $repDiv.append($colorSpan);
        })
        self.$colorFieldsDiv.append($repDiv);
      })
      self.$container.append(self.$colorFieldsDiv);
    },

    _addColorSample: function() {
      var self = this;
      self.$colorSampleDiv = $('<div class="color_sample" />');
      self.$container.append(self.$colorSampleDiv);
    },

    _addCloseButton: function() {
      var self = this;
      var $p = $('<p class="clear" style="text-align: center; margin-top: 30px" />');
      self.$closeButton = $('<a href="#" />').html("Close box");
      self.$closeButton.bind('click', function() {
        self.close();
      })
      $p.append(self.$closeButton);
      self.$container.append($p);
    },

    _addEvents: function() {
      var self = this;
      $(document).bind({
        "keyup.ColorPickerBox": function(event) {
          var key = event.keyCode;
          if (key == Keyboard.ESC_KEY) {
            self.close();
          }
        }
      })
      self.$hueSatDiv.mouseTracker({
        'mousedown mousedrag': function() {
          self._positionHueSatSelectorFromMouse();
          self._setHueAndSatFromSelectorPosition();
          self._setColorFields();
          self._setColorSample();
          self._drawLightnessCanvas();
          if (self.options.change) self.options.change.call(self, self.currentColor);
        }//,
        //debug: true
      })
      self.$lightnessDiv.mouseTracker({
        'mousedown mousedrag': function() {
          self._positionLightnessSelectorFromMouse();
          self._setLightnessFromSelectorPosition();
          self._setColorFields();
          self._setColorSample();
          if (self.options.change) self.options.change.call(self, self.currentColor);
        }//,
        //debug: true
      })
    },

    _removeEvents: function() {
      var self = this;
      $(document).unbind("keyup.ColorPickerBox");
      self.$hueSatDiv.mouseTracker('destroy');
      self.$lightnessDiv.mouseTracker('destroy');
    },

    _setColorFields: function() {
      var self = this;
      $.v(Color.components).chain().values().flatten().each(function(cpt) {
        self.colorFields[cpt].val(String(self.currentColor[cpt]));
      });
    },

    _positionHueSatSelectorFromMouse: function() {
      var self = this;
      // This 5 here is just a value I found matches up with the center of the selector image
      var mouse = self.$hueSatDiv.mouseTracker('pos').rel;
      var top = mouse.y - 5;
      var left = mouse.x - 5;
      self.$hueSatSelectorDiv.css("background-position", left+"px "+top+"px");
    },

    _positionLightnessSelectorFromMouse: function() {
      var self = this;
      var mouse = self.$lightnessDiv.mouseTracker('pos').rel;
      // This 5 here is just a value I found matches up with the center of the selector image
      var top = mouse.y - 5;
      self.$lightnessDiv.css("background-position", "0px "+top+"px");
    },

    _positionHueSatSelectorFromColor: function() {
      var self = this;
      var top = self._sat2px();
      var left = self._hue2px();
      self.$hueSatSelectorDiv.css("background-position", left+"px "+top+"px");
    },

    _positionLightnessSelectorFromColor: function() {
      var self = this;
      var top = self._lit2px();
      self.$lightnessDiv.css("background-position", "0px "+top+"px");
    },

    _setHueAndSatFromSelectorPosition: function() {
      var self = this;
      self.currentColor.hue = self._px2hue();
      self.currentColor.saturation = self._px2sat();
      self.currentColor.refreshRGB();
    },

    _setLightnessFromSelectorPosition: function() {
      var self = this;
      self.currentColor.lightness = self._px2lit();
      self.currentColor.refreshRGB();
    },

    _setColorSample: function() {
      var self = this;
      self.$colorSampleDiv.css("background-color", "rgb("+self.currentColor.toRGBString()+")");
    },

    _sat2px: function() {
      var self = this;
      var s = self.currentColor.saturation;
      var h = self.hueSatCanvasSize.height;
      // s = 100..0 -> y = 0..height
      var y = Math.round(-s * (h / 100) + h);
      return y;
    },
    _px2sat: function() {
      var self = this;
      var pos = self.$hueSatDiv.mouseTracker('pos').rel;
      var y = pos.y;
      var h = self.hueSatCanvasSize.height;
      // y = 0..height -> s = 100..0
      var s = Math.round(-100 * (y - h) / h);
      return s;
    },

    _hue2px: function() {
      var self = this;
      var h = self.currentColor.hue;
      var w = self.hueSatCanvasSize.width;
      // h = 0..360 -> x = 0..width
      var x = Math.round(h * (w / 360));
      return x;
    },
    _px2hue: function() {
      var self = this;
      var pos = self.$hueSatDiv.mouseTracker('pos').rel;
      var x = pos.x;
      var w = self.hueSatCanvasSize.width;
      var h = Math.round((360 * x) / w);
      return h;
    },

    _lit2px: function() {
      var self = this;
      var l = self.currentColor.lightness;
      var h = self.lightnessCanvasSize.height;
      // l = 100..0 -> y = 0..height
      var y = Math.round(-l * (h / 100) + h);
      return y;
    },
    _px2lit: function() {
      var self = this;
      var pos = self.$lightnessDiv.mouseTracker('pos').rel;
      var y = pos.y;
      var h = self.lightnessCanvasSize.height;
      // y = 0..height -> l = 100..0
      var l = Math.round(-100 * (y - h) / h);
      return l;
    }
  }
  SpriteEditor.ColorPickerBox = ColorPickerBox;

})(window, window.document, window.ender);