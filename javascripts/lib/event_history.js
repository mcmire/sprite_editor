(function() {
  $["export"]("SpriteEditor.EventHistory", {
    events: [],
    currentEvent: null,
    currentIndex: -1,
    init: function(app) {
      return this.app = app;
    },
    recordEvent: function(obj, method) {
      var action, event, nextIndex;
      action = obj.actions[method];
      event = action["do"]();
      if (this.events.length === 100) {
        this.events.shift();
      }
      nextIndex = this.currentIndex + 1;
      this.events.length = nextIndex;
      this.events[nextIndex] = {
        object: obj,
        method: method,
        action: action,
        event: event
      };
      return this.currentIndex++;
    },
    undo: function() {
      var e;
      e = this.events[this.currentIndex];
      e.action.undo(e.event);
      return this.currentIndex--;
    },
    canUndo: function() {
      return this.currentIndex > -1;
    },
    redo: function() {
      var e;
      e = this.events[this.currentIndex + 1];
      e.action.redo(e.event);
      return this.currentIndex++;
    },
    canRedo: function() {
      return this.currentIndex < this.events.length - 1;
    }
  });
}).call(this);
