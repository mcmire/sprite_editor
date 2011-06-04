(function($, undefined) {

var EventHistory = {
  eventStack: [],
  lastEvent: null,

  init: function(app) {
    self.app = app;
  },

  recordEvent: function(obj, callback) {
    var self = this;
    var currentEvent = [];
    self.eventStack.push(currentEvent);
    callback();
    if (self.eventStack.length == 1) {
      // If we are already inside a recordEvent block, don't save the event --
      // we will handle this in recordAction(), below.
      self.app.history.push(currentEvent);
    }
    self.eventStack.pop();
    self.lastEvent = currentEvent;
  },

  recordAction: function(obj, method, args) {
    var self = this;
    obj[method].apply(obj, args);
    var currentEvent = self.eventStack[self.eventStack.length-1];
    if (self.eventStack.length > 0 && self.lastEvent) {
      /*
       * If we're here, that means that during the method just called,
       * another event was recorded (yes, inside the event we're already in).
       * We have a reference to this nested event, so instead of adding the
       * action just performed to the current event, merge any actions into
       * *this* event that occurred within said nested event.
       *
       * For instance, say we have something like this:
       *
       *   obj = {
       *     someMethod: function() {
       *       this.recordEvent(function() {
       *         // ... do something ...
       *         this.recordAction('foo');
       *       })
       *     },
       *     foo: function() {
       *       this.recordEvent(function() {
       *         this.recordAction('bar');
       *         this.recordAction('baz')
       *       })
       *     },
       *     bar: function() {
       *       // ...
       *     },
       *     baz: function() {
       *       // ...
       *     }
       *   }
       *
       * In this case, when someMethod() was called, instead of recording that
       * the "foo" method was called, we'd record that "bar" and "baz" were
       * called.
       */
      currentEvent.push.apply(currentEvent, self.lastEvent);
      self.lastEvent = null;
    } else {
      currentEvent.push([obj, method, args]);
    }
  }
};
$.export('SpriteEditor.EventHistory', EventHistory);

})(window.ender);