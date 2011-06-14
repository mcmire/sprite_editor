(function($, undefined) {

var EventHistory = {
  events: [],
  currentEvent: null,
  currentIndex: -1,

  init: function(app) {
    var self = this;
    self.app = app;
    return self;
  },

  recordEvent: function(obj, method) {
    var self = this;
    var action = obj.actions[method];
    var event = action.do();
    // Limit history to 100 events
    if (self.events.length == 100) {
      self.events.shift();
    }
    // If the user just performed an undo, all future history which was
    // saved is now gone - POOF!
    var nextIndex = self.currentIndex+1;
    self.events.length = nextIndex;
    self.events[nextIndex] = {object: obj, method: method, action: action, event: event};
    self.currentIndex++;
  },

  undo: function() {
    var self = this;
    var e = self.events[self.currentIndex];
    e.action.undo(e.event);
    self.currentIndex--;
  },
  canUndo: function() {
    var self = this;
    return (self.currentIndex > -1);
  },

  redo: function() {
    var self = this;
    var e = self.events[self.currentIndex+1];
    e.action.redo(e.event);
    self.currentIndex++;
  },
  canRedo: function() {
    var self = this;
    return (self.currentIndex < self.events.length-1);
  }
};
$.export('SpriteEditor.EventHistory', EventHistory);

})(window.ender);