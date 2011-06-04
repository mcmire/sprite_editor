(function($, undefined) {

var Eventable = {
  recordEvent: function(callback) {
    this.editor.recordEvent(this, callback);
  },

  recordAction: function(/* method, args... */) {
    this.editor.recordAction(this, method, arguments);
  }
}
$.export('SpriteEditor.Eventable', Eventable);

})(window.ender);