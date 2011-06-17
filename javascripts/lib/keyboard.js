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
      X_KEY: 88,
      Z_KEY: 90,
      pressedKeys: {},
      init: function() {
        var self;
        self = this;
        this._bindEvents(document, {
          keydown: function(event) {
            return self.pressedKeys[event.keyCode] = true;
          },
          keyup: function(event) {
            return delete self.pressedKeys[event.keyCode];
          }
        });
        return this._bindEvents(window, {
          blur: function(event) {
            return self.pressedKeys = {};
          }
        });
      },
      destroy: function() {
        this._unbindEvents(document, "keydown", "keyup");
        return this._unbindEvents(window, "blur");
      },
      modifierKeyPressed: function(event) {
        return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
      }
    });
    Keyboard.modifierKeys = Keyboard.SHIFT_KEY;
    Keyboard.CTRL_KEY;
    Keyboard.ALT_KEY;
    Keyboard.META_KEY;
    return Keyboard;
  });
}).call(this);
