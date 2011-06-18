(function() {
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $["export"]("SpriteEditor.ColorPicker", function(SpriteEditor) {
    var ColorPicker, Keyboard;
    Keyboard = SpriteEditor.Keyboard;
    ColorPicker = {};
    SpriteEditor.DOMEventHelpers.mixin(ColorPicker, "SpriteEditor_ColorPicker");
    $.extend(ColorPicker, {
      $container: null,
      hueSatCanvas: null,
      lumCanvas: null,
      colorFields: {},
      hueSatCanvasSize: {
        width: 265,
        height: 300
      },
      lumCanvasSize: {
        width: 25,
        height: 300
      },
      currentColor: (new SpriteEditor.Color.RGB(255, 0, 0)).toHSL(),
      currentColorType: null,
      init: function(app, options) {
        this.app = app;
        this.options = options;
        this.$container = $('<div class="square_color_picker dialog" />').hide();
        this._addHueSatDiv();
        this._addLumDiv();
        this._addColorFields();
        this._addColorSample();
        this._addCloseButton();
        return this;
      },
      addEvents: function() {
        var self;
        self = this;
        this._bindEvents(document, {
          keyup: function(event) {
            var key;
            key = event.keyCode;
            if (key === Keyboard.ESC_KEY) {
              return self.close();
            }
          }
        });
        this.$hueSatDiv.mouseTracker({
          "mousedown mousedrag": function() {
            self._positionHueSatSelectorFromMouse();
            self._setHueAndSatFromSelectorPosition();
            self._drawLumCanvas();
            return self.update();
          }
        });
        return this.$lumDiv.mouseTracker({
          "mousedown mousedrag": function() {
            self._positionLumSelectorFromMouse();
            self._setLumFromSelectorPosition();
            return self.update();
          }
        });
      },
      removeEvents: function() {
        this._unbindEvents(document, "keyup");
        this.$hueSatDiv.mouseTracker("destroy");
        return this.$lumDiv.mouseTracker("destroy");
      },
      open: function(color, colorType) {
        this.currentColor = color;
        this.currentColorType = colorType;
        this.trigger("open");
        this.$container.show().center();
        this._drawLumCanvas();
        this._setColorFields();
        this._positionHueSatSelectorFromColor();
        this._positionLumSelectorFromColor();
        this._setColorSample();
        return this.addEvents();
      },
      close: function() {
        this.currentColorType = null;
        this.$container.hide();
        this.removeEvents();
        return this.trigger("close");
      },
      trigger: function() {
        var args, method, _ref;
        method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return (_ref = this.options[method]) != null ? _ref.apply(this, args) : void 0;
      },
      update: function() {
        this._setColorFields();
        this._setColorSample();
        return this.app.boxes.colors.update(this.currentColor);
      },
      _addHueSatDiv: function() {
        var $div;
        $div = this.$hueSatDiv = $('<div class="hue_sat_div" />');
        $div.css({
          width: this.hueSatCanvasSize.width,
          height: this.hueSatCanvasSize.height
        });
        this.$container.append($div);
        this._addHueSatCanvas();
        return this._addHueSatSelectorDiv();
      },
      _addHueSatCanvas: function() {
        this.hueSatCanvas = SpriteEditor.Canvas.create(this.hueSatCanvasSize.width, this.hueSatCanvasSize.height, __bind(function(c) {
          var h, hsl, imageData, rgb, s, x, y, _ref, _ref2;
          imageData = c.ctx.createImageData(c.width, c.height);
          hsl = this.currentColor;
          for (y = 0, _ref = c.height; 0 <= _ref ? y < _ref : y > _ref; 0 <= _ref ? y++ : y--) {
            for (x = 0, _ref2 = c.width; 0 <= _ref2 ? x < _ref2 : x > _ref2; 0 <= _ref2 ? x++ : x--) {
              h = Math.round(x * (360 / c.width));
              s = Math.round(y * (-100 / c.height) + 100);
              rgb = hsl["with"]({
                hue: h,
                sat: s
              }).toRGB();
              imageData.setPixel(x, y, rgb.red, rgb.green, rgb.blue, 255);
            }
          }
          return c.ctx.putImageData(imageData, 0, 0);
        }, this));
        this.hueSatCanvas.$element.addClass("hue_sat_canvas");
        return this.$hueSatDiv.append(this.hueSatCanvas.$element);
      },
      _addHueSatSelectorDiv: function() {
        this.$hueSatSelectorDiv = $('<div class="hue_sat_selector" />');
        return this.$hueSatDiv.append(this.$hueSatSelectorDiv);
      },
      _addLumDiv: function() {
        this.$lumDiv = $("<div class=\"lum_div\" />");
        this.$lumDiv.css({
          width: this.lumCanvasSize.width + 11,
          height: this.lumCanvasSize.height
        });
        this.$container.append(this.$lumDiv);
        return this._addLumCanvas();
      },
      _addLumCanvas: function() {
        this.lumCanvas = SpriteEditor.Canvas.create(this.lumCanvasSize.width, this.lumCanvasSize.height);
        this.lumCanvas.$element.addClass("lum_canvas");
        return this.$lumDiv.append(this.lumCanvas.$element);
      },
      _drawLumCanvas: function() {
        var c, hsl, imageData, l, rgb, x, y, _ref, _ref2;
        c = this.lumCanvas;
        imageData = c.ctx.createImageData(c.width, c.height);
        hsl = this.currentColor;
        for (y = 0, _ref = c.height; 0 <= _ref ? y < _ref : y > _ref; 0 <= _ref ? y++ : y--) {
          l = Math.round((-100 / c.height) * y + 100);
          rgb = hsl["with"]({
            lum: l
          }).toRGB();
          for (x = 0, _ref2 = c.width; 0 <= _ref2 ? x < _ref2 : x > _ref2; 0 <= _ref2 ? x++ : x--) {
            imageData.setPixel(x, y, rgb.red, rgb.green, rgb.blue, 255);
          }
        }
        return c.ctx.putImageData(imageData, 0, 0);
      },
      _addColorFields: function() {
        var $colorField, $colorSpan, $repDiv, cpt, rep, repName, _i, _len, _ref;
        this.$colorFieldsDiv = $('<div class="color_fields" />');
        _ref = SpriteEditor.Color.componentsByRepresentation;
        for (repName in _ref) {
          rep = _ref[repName];
          $repDiv = $('<div class="' + repName + '_fields" />');
          for (_i = 0, _len = rep.length; _i < _len; _i++) {
            cpt = rep[_i];
            $colorSpan = $('<span />');
            $colorField = $('<input type="text" size="3" />');
            this.colorFields[cpt] = $colorField;
            $colorSpan.html(cpt[0].toUpperCase() + ": ").append($colorField);
            $repDiv.append($colorSpan);
          }
          this.$colorFieldsDiv.append($repDiv);
        }
        return this.$container.append(this.$colorFieldsDiv);
      },
      _addColorSample: function() {
        this.$colorSampleDiv = $('<div class="color_sample" />');
        return this.$container.append(this.$colorSampleDiv);
      },
      _addCloseButton: function() {
        var $p;
        $p = $('<p class="clear" style="text-align: center; margin-top: 30px" />');
        this.$closeButton = $('<a href="#" />').html("Close box");
        this.$closeButton.bind("click", __bind(function() {
          return this.close();
        }, this));
        $p.append(this.$closeButton);
        return this.$container.append($p);
      },
      _setColorFields: function() {
        var hsl, prop, rgb, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _results;
        hsl = this.currentColor;
        rgb = hsl.toRGB();
        _ref = SpriteEditor.Color.RGB.properties;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          prop = _ref[_i];
          if ((_ref2 = this.colorFields[prop]) != null) {
            _ref2.val(String(rgb[prop]));
          }
        }
        _ref3 = SpriteEditor.Color.HSL.properties;
        _results = [];
        for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
          prop = _ref3[_j];
          _results.push((_ref4 = this.colorFields[prop]) != null ? _ref4.val(String(hsl[prop])) : void 0);
        }
        return _results;
      },
      _positionHueSatSelectorFromMouse: function() {
        var left, mouse, top;
        mouse = this.$hueSatDiv.mouseTracker("pos").rel;
        top = mouse.y - 5;
        left = mouse.x - 5;
        return this.$hueSatSelectorDiv.css("background-position", left + "px " + top + "px");
      },
      _positionLumSelectorFromMouse: function() {
        var mouse, top;
        mouse = this.$lumDiv.mouseTracker("pos").rel;
        top = mouse.y - 5;
        return this.$lumDiv.css("background-position", "0px " + top + "px");
      },
      _positionHueSatSelectorFromColor: function() {
        var left, top;
        top = this._sat2px();
        left = this._hue2px();
        return this.$hueSatSelectorDiv.css("background-position", left + "px " + top + "px");
      },
      _positionLumSelectorFromColor: function() {
        var top;
        top = this._lum2px();
        return this.$lumDiv.css("background-position", "0px " + top + "px");
      },
      _setHueAndSatFromSelectorPosition: function() {
        return this.currentColor = this.currentColor["with"]({
          hue: this._px2hue(),
          sat: this._px2sat()
        });
      },
      _setLumFromSelectorPosition: function() {
        return this.currentColor = this.currentColor["with"]({
          lum: this._px2lum()
        });
      },
      _setColorSample: function() {
        return this.$colorSampleDiv.css("background-color", this.currentColor.toRGB().toString());
      },
      _sat2px: function() {
        var h, s, y;
        s = this.currentColor.sat;
        h = this.hueSatCanvasSize.height;
        y = Math.round(-s * (h / 100) + h);
        return y;
      },
      _px2sat: function() {
        var h, pos, s, y;
        pos = this.$hueSatDiv.mouseTracker("pos").rel;
        y = pos.y;
        h = this.hueSatCanvasSize.height;
        s = Math.round(-100 * (y - h) / h);
        return s;
      },
      _hue2px: function() {
        var h, w, x;
        h = this.currentColor.hue;
        w = this.hueSatCanvasSize.width;
        x = Math.round(h * (w / 360));
        return x;
      },
      _px2hue: function() {
        var h, pos, w, x;
        pos = this.$hueSatDiv.mouseTracker("pos").rel;
        x = pos.x;
        w = this.hueSatCanvasSize.width;
        h = Math.round((360 * x) / w);
        return h;
      },
      _lum2px: function() {
        var h, l, y;
        l = this.currentColor.lum;
        h = this.lumCanvasSize.height;
        y = Math.round(-l * (h / 100) + h);
        return y;
      },
      _px2lum: function() {
        var h, l, pos, self, y;
        self = this;
        pos = this.$lumDiv.mouseTracker("pos").rel;
        y = pos.y;
        h = this.lumCanvasSize.height;
        l = Math.round(-100 * (y - h) / h);
        return l;
      }
    });
    return ColorPicker;
  });
}).call(this);
