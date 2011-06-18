(function() {
  $["export"]("SpriteEditor.Eventable", {
    actions: {},
    recordEvent: function(method) {
      return this.app.history.recordEvent(this, method);
    },
    addAction: function(name, routines) {
      return this.actions[name] = routines;
    }
  });
}).call(this);
