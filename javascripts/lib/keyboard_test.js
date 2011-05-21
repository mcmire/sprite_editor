(function(window, document, $, undefined) {

  var checkboxes = {};

  $(document).bind({
    keydown: function(event) {
      var key = event.keyCode;
      $keyCodeField.attr('value', key);
      if (key in checkboxes) {
        checkboxes[key].attr('checked', 'checked');
      }
      // Cancel keystrokes (most importantly tab) except for key combinations
      // that consist of a modifier key + another key so that we can press
      // Command-R (for instance) to refresh the page
      if ($.v.indexOf(Keyboard.modifierKeys, key) == -1 && !Keyboard.modifierKeyPressed(event)) {
        event.preventDefault();
      }
    },
    keyup: function(event) {
      var key = event.keyCode;
      $keyCodeField.attr('value', "");
      if (key in checkboxes) {
        checkboxes[key].removeAttr('checked');
      }
      if ($.v.keys(Keyboard.pressedKeys).length == 0) {
        $.v.each(checkboxes, function(key, $box) { $box.removeAttr('checked') })
      }
    }
  });
  $(window).bind({
    blur: function(event) {
      $keyCodeField.attr('value', "");
      $.v.each(checkboxes, function(key, $box) { $box.removeAttr('checked') });
    }
  });

  var $keyCodeField = window.$keyCodeField = $('<input type="text" />');
  var $p = $('<p />').html("Key code:").append($keyCodeField);
  $(document.body).append($p);

  checkboxes[Keyboard.SHIFT_KEY] = $('<input type="checkbox" />');
  checkboxes[Keyboard.ALT_KEY]   = $('<input type="checkbox" />');
  checkboxes[Keyboard.CTRL_KEY]  = $('<input type="checkbox" />');
  checkboxes[Keyboard.META_KEY]  = $('<input type="checkbox" />');

  var $p = $('<p />')
    .append( $('<label />').html("shift").append(checkboxes[Keyboard.SHIFT_KEY]) )
    .append( $('<label />').html("alt").append(checkboxes[Keyboard.ALT_KEY]) )
    .append( $('<label />').html("ctrl").append(checkboxes[Keyboard.CTRL_KEY]) )
    .append( $('<label />').html("meta").append(checkboxes[Keyboard.META_KEY]) );
  $(document.body).append($p);

})(window, window.document, window.ender);