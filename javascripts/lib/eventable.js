(function($, undefined) {

var Eventable = {
  actions: {},

  recordEvent: function(method) {
    var self = this;
    self.app.history.recordEvent(self, method);
  },

  addAction: function(name, routines) {
    var self = this;
    self.actions[name] = routines;
  }
}
$.export('SpriteEditor.Eventable', Eventable);

})(window.ender);