(function() {
  $["export"]("SpriteEditor.Keyboard", function(SpriteEditor) {
    var Keyboard;
    Keyboard = {};
    SpriteEditor.DOMEventHelpers.mixin(Keyboard, "SpriteEditor_Keyboard");
    $.extend(Keyboard, {
      TAB_KEY: 9,
      ESC_KEY: 27,
      SHIFT_KEY: 16,
      CTRL_KEY: 17,
      ALT_KEY: 18,
      META_KEY: 91,
      KEY_1: 49,
      KEY_2: 50,
      KEY_3: 51,
      KEY_4: 52,
      E_KEY: 69,
      G_KEY: 71,
      Q_KEY: 81,
      S_KEY: 83,
      X_KEY: 88,
      Z_KEY: 90,
      modifierKeys: [16, 17, 18, 91],
      init: function() {
        var self;
        self = this;
        this.reset();
        this._bindEvents(document, {
          keydown: function(event) {
            return self.pressedKeys[event.keyCode] = 1;
          },
          keyup: function(event) {
            return delete self.pressedKeys[event.keyCode];
          }
        });
        this._bindEvents(window, {
          blur: function(event) {
            return self.reset();
          }
        });
        return this;
      },
      reset: function() {
        return this.pressedKeys = {};
      },
      destroy: function() {
        this._unbindEvents(document, "keydown", "keyup");
        return this._unbindEvents(window, "blur");
      },
      modifierKeyPressed: function(event) {
        return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
      }
    });
    return Keyboard;
  });
}).call(this);
