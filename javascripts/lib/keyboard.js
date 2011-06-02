(function(window, document, $, undefined) {

var Keyboard = {
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
    var self = this;
    $(document).bind({
      "keydown.Keyboard": function(event) {
        self.pressedKeys[event.keyCode] = true;
      },
      "keyup.Keyboard": function(event) {
        delete self.pressedKeys[event.keyCode];
      }
    });
    $(window).bind({
      "blur.Keyboard": function(event) {
        self.pressedKeys = {};
      }
    });
  },

  destroy: function() {
    var self = this;
    $(document).unbind('keydown.Keyboard', 'keyup.Keyboard');
    $(window).unbind('blur.Keyboard');
  },

  modifierKeyPressed: function(event) {
    return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
  }
};
Keyboard.modifierKeys = [
  Keyboard.SHIFT_KEY,
  Keyboard.CTRL_KEY,
  Keyboard.ALT_KEY,
  Keyboard.META_KEY
]
$.export('SpriteEditor.Keyboard', Keyboard);

})(window, window.document, window.ender);