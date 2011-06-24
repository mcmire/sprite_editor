(function() {
  $["export"]("SpriteEditor.EventHistory", {
    init: function(app) {
      this.app = app;
      this._reset();
      return this;
    },
    recordEvent: function(obj, method) {
      var action, data;
      action = obj.actions[method];
      data = action["do"]();
      if (this.events.length === 100) {
        this.events.shift();
        this.currentIndex = 99;
      } else {
        this.currentIndex++;
        this.events.length = this.currentIndex;
      }
      return this.events[this.currentIndex] = {
        object: obj,
        method: method,
        action: action,
        data: data
      };
    },
    undo: function() {
      var e;
      if (this.currentIndex > -1) {
        e = this.events[this.currentIndex];
        e.action.undo(e.data);
        return this.currentIndex--;
      }
    },
    redo: function() {
      var e;
      if (this.currentIndex < this.events.length - 1) {
        e = this.events[this.currentIndex + 1];
        e.action.redo(e.data);
        return this.currentIndex++;
      }
    },
    _reset: function() {
      this.events = [];
      this.currentEvent = null;
      return this.currentIndex = -1;
    }
  });
}).call(this);
