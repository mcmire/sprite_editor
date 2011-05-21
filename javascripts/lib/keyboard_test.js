(function(window, document, $, undefined) {

  var Keyboard = {
    SHIFT_KEY: 16,
    CTRL_KEY: 17,
    ALT_KEY: 18,
    META_KEY: 91,

    pressedKeys: {}
  }

  var checkboxes = {};

  $(document).bind({
    keydown: function(event) {
      var key = event.keyCode;
      $keyCodeField.attr('value', key);
      Keyboard.pressedKeys[key] = true;
      if (key in checkboxes) checkboxes[key].attr('checked', 'checked');
      event.preventDefault();
    },
    keyup: function(event) {
      var key = event.keyCode;
      $keyCodeField.attr('value', "");
      delete Keyboard.pressedKeys[key];
      if (key in checkboxes) checkboxes[key].removeAttr('checked');
      if ($.v.keys(Keyboard.pressedKeys).length == 0) {
        $.v.each(checkboxes, function(key, $box) { $box.removeAttr('checked') })
      }
    }
  });
  // Yeah, the whole [...] thing is a quirk in Bonzo
  $([window]).bind({
    blur: function(event) {
      $keyCodeField.attr('value', "");
      Keyboard.pressedKeys = {};
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