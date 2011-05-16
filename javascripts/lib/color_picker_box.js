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
    currentMouse: {
      isDown: false,
      x: null,
      y: null
    },
  
    init: function($parent) {
      var self = this;
    
      self.$container = $('<div class="square_color_picker dialog" />');
      $parent.append(self.$container);
      
      self._addHueSatDiv();
      self._addLightnessCanvas();
      self._addColorFields();
      self._addColorSample();
      
      self.$container.center();
      // cache these for later use so we don't have to call them over and over
      //self.hueSatCanvas.offset = self.hueSatCanvas.$element.offset();
      self.hueSatCanvas.position = self.hueSatCanvas.$element.position();
      
      self.setColorFields();
      self.positionSelectorFromCurrentColor();
      self.setColorSample();
      
      self._addEvents();
      
      return self;
    },
    
    _addEvents: function() {
      var self = this;
      var $elem = self.$hueSatSelectorDiv;
      $elem.trackMouse({
        on: {
          mousedown: function() {
            $elem.addClass("dragging");
          },
          dragOrMouseDown: function() {
            self.positionSelectorFromMousePos();
            self.setCurrentColor();
            self.setColorFields();
            self.setColorSample();
          },
          mouseup: function() {
            $elem.removeClass("dragging");
            self.positionSelectorFromCurrentColor();
          }
        }
      })
    },
    
    _addHueSatDiv: function() {
      var self = this;
      self.$hueSatDiv = $('<div class="hue_sat_div" />');
      self.$container.append(self.$hueSatDiv);
      self._addHueSatCanvas();
      self._addHueSatSelectorDiv();
    },
    
    _addHueSatCanvas: function() {
      var self = this;
      self.hueSatCanvas = Canvas.create(self.hueSatCanvasSize.width, self.hueSatCanvasSize.height, function(c) {
        var imageData = c.ctx.createImageData(c.width, c.height);
        var color;
        for (var y=0; y<c.height; y++) {
          for (var x=0; x<c.width; x++) {
            // x = 0..width  -> h = 0..360
            // y = 0..height -> s = 100..0
            var h = Math.round(x * (360 / c.width));
            var s = Math.round(y * (-100 / c.height) + 100);
            color = self.currentColor.withHSL({hue: h, saturation: s});
            imageData.fillPixel(x, y, color.red, color.green, color.blue, 255);
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
    
    _addLightnessCanvas: function() {
      var self = this;
      self.lightnessCanvas = Canvas.create(self.lightnessCanvasSize.width, self.lightnessCanvasSize.height, function(c) {
        var imageData = c.ctx.createImageData(c.width, c.height);
        var color;
        for (var y=0; y<c.height; y++) {
          // y = 0..height -> l = 100..0
          var l = Math.round((-100 / c.height) * y + 100);
          color = self.currentColor.withHSL({lightness: l});
          for (var x=0; x<c.width; x++) {
            imageData.fillPixel(x, y, color.red, color.blue, color.green, 255);
          }
        }
        c.ctx.putImageData(imageData, 0, 0);
      })
      self.lightnessCanvas.$element.addClass("lightness_canvas");
      self.$container.append(self.lightnessCanvas.$element);
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
    
    setColorFields: function() {
      var self = this;
      $.v(Color.components).chain().values().flatten().each(function(cpt) {
        self.colorFields[cpt].val(String(self.currentColor[cpt]));
      });
    },
    
    positionSelectorFromMousePos: function() {
      var self = this;
      var mouse = self.$hueSatSelectorDiv.data('mouse');
      var top = mouse.pos.rel.y - 2;
      var left = mouse.pos.rel.x - 2;
      self.$hueSatSelectorDiv.css("background-position", left+"px "+top+"px");
    },
    
    positionSelectorFromCurrentColor: function() {
      var self = this;
      var top = self._sat2px() - 2;
      var left = self._hue2px() - 2;
      self.$hueSatSelectorDiv.css("background-position", left+"px "+top+"px");
    },
    
    setCurrentColor: function() {
      var self = this;
      self.currentColor.hue = self._px2hue();
      self.currentColor.saturation = self._px2sat();
      self.currentColor.refreshRGB();
    },
    
    setColorSample: function() {
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
      var mouse = self.$hueSatSelectorDiv.data('mouse');
      var y = mouse.pos.rel.y;
      var h = self.hueSatCanvasSize.height;
      // y = 0..height -> s = 100..0
      var s = Math.round(-100 * (y - h) / h);
      return s;
    },
    
    _hue2px: function() {
      var self = this;
      var h = self.currentColor.hue;
      var w = self.hueSatCanvasSize.width;
      // h = 0..360 -> y = 0..width
      var x = Math.round(h * (w / 360));
      return x;
    },
    _px2hue: function() {
      var self = this;
      var mouse = self.$hueSatSelectorDiv.data('mouse');
      var x = mouse.pos.rel.x;
      var w = self.hueSatCanvasSize.width;
      var h = Math.round((360 * x) / w);
      return h;
    }
  }
  SpriteEditor.ColorPickerBox = ColorPickerBox;

})(window, window.document, window.ender);