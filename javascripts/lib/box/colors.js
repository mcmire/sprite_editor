(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $["export"]("SpriteEditor.Box.Colors", function(SpriteEditor) {
    var Colors, Keyboard;
    Keyboard = SpriteEditor.Keyboard;
    Colors = {};
    SpriteEditor.DOMEventHelpers.mixin(Colors, "SpriteEditor_Box_Colors");
    $.extend(Colors, {
      name: "Colors",
      header: "Colors",
      colorTypes: ["foreground", "background"],
      colorSampleDivs: {
        foreground: null,
        background: null
      },
      currentColorType: "foreground",
      currentColors: {
        foreground: new SpriteEditor.Color({
          red: 172,
          green: 85,
          blue: 255
        }),
        background: new SpriteEditor.Color({
          red: 255,
          green: 38,
          blue: 192
        })
      },
      init: function(app) {
        var type, _fn, _i, _len, _ref;
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
          $div.trigger("render");
          self.$element.append($div);
          return self.colorSampleDivs[type] = $div;
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          type = _ref[_i];
          _fn(this, type);
        }
        this._selectColorType(this.currentColorType);
        return this;
      },
      addEvents: function() {
        return this._bindEvents(document, {
          keydown: __bind(function(event) {
            var key;
            key = event.keyCode;
            switch (key) {
              case Keyboard.X_KEY:
                return this._switchForegroundAndBackgroundColor();
              case Keyboard.SHIFT_KEY:
                return this._selectColorType("background");
            }
          }, this),
          keyup: __bind(function(event) {
            return this._selectColorType("foreground");
          }, this)
        });
      },
      removeEvents: function() {
        return this._unbindEvents(document, "keydown");
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
