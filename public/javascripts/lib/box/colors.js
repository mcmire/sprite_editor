(function() {

  $["export"]("SpriteEditor.Box.Colors", function(SpriteEditor) {
    var Color, Colors, Keyboard;
    Keyboard = SpriteEditor.Keyboard;
    Color = SpriteEditor.Color;
    Colors = {};
    SpriteEditor.DOMEventHelpers.mixin(Colors, "SpriteEditor_Box_Colors");
    $.extend(Colors, {
      name: "Colors",
      header: "Colors",
      colorTypes: ["foreground", "background"],
      init: function(app) {
        var $div, type, _fn, _i, _len, _ref, _ref1;
        SpriteEditor.Box.init.call(this, app);
        this.colorSampleDivs = {};
        _ref = this.colorTypes;
        _fn = function(self, type) {
          var $div;
          $div = $('<div class="color_sample" />');
          $div.bind({
            click: function() {
              return self.app.colorPicker.open(self.currentColors[type], type);
            },
            render: function() {
              return $div.css("background-color", self.currentColors[type].toRGBAString());
            }
          });
          self.$element.append($div);
          return self.colorSampleDivs[type] = $div;
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          type = _ref[_i];
          _fn(this, type);
        }
        this.reset();
        _ref1 = this.colorSampleDivs;
        for (type in _ref1) {
          $div = _ref1[type];
          $div.trigger("render");
        }
        return this;
      },
      destroy: function() {
        SpriteEditor.Box.destroy.call(this);
        this.colorSampleDivs = {};
        this.currentColorType = null;
        this.currentColors = {};
        this.removeEvents();
        return this;
      },
      reset: function() {
        this.currentColorType = "foreground";
        this.currentColors = {
          foreground: new Color({
            red: 172,
            green: 85,
            blue: 255
          }),
          background: new Color({
            red: 255,
            green: 38,
            blue: 192
          })
        };
        return this._selectColorType(this.currentColorType);
      },
      addEvents: function() {
        var _this = this;
        return this._bindEvents(document, {
          keydown: function(event) {
            var key;
            key = event.keyCode;
            switch (key) {
              case Keyboard.X_KEY:
                return _this._switchForegroundAndBackgroundColor();
              case Keyboard.SHIFT_KEY:
                return _this._selectColorType("background");
            }
          },
          keyup: function(event) {
            return _this._selectColorType("foreground");
          }
        });
      },
      removeEvents: function() {
        return this._unbindEvents(document, "keydown", "keyup");
      },
      update: function(color) {
        this.currentColors[this.currentColorType] = color;
        return this.colorSampleDivs[this.currentColorType].trigger("render");
      },
      currentColor: function() {
        return this.currentColors[this.currentColorType];
      },
      _selectColorType: function(colorType) {
        this.colorSampleDivs[this.currentColorType].removeClass("selected");
        this.currentColorType = colorType;
        return this.colorSampleDivs[colorType].addClass("selected");
      },
      _switchForegroundAndBackgroundColor: function() {
        var tmp;
        tmp = this.currentColors.foreground;
        this.currentColors.foreground = this.currentColors.background;
        this.currentColors.background = tmp;
        this.colorSampleDivs.foreground.trigger("render");
        return this.colorSampleDivs.background.trigger("render");
      }
    });
    return Colors;
  });

}).call(this);
