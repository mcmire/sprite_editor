(function($, undefined) {

/*
var EventAction = function(props) {
  $.extend(this, props);
}
$.extend(EventAction.prototype, {
  "do": function(action, event, data) {
    action.redo.call(self, event.before, data);
  }
});
*/

var Eventable = {
  actions: {},

  /*
  createEvent: function(data, options) {
    var self = this;
    var event = {
      before: {me: {}},
      after: {me: {}}
    }
    self.wrapEvent(event.before, data);
    options.before(event.before);
    options.on(event);
    self.wrapEvent(event.after, data);
    options.after(event.after);
    return event;
  },
  */

  /*
  recordEvent: function(/*method[, data], fn*\/) {
    var self = this;
    var method, data, fn;
    if (arguments.length == 3) {
      method = arguments[0],
      data   = arguments[1],
      fn     = arguments[2]
    } else {
      method = arguments[0],
      fn     = arguments[1]
    }
    self.app.history.recordEvent(self, method, data, {
      before: function(event) {
        self.wrapEvent(event, data);
      },
      on: fn,
      after: function(event) {
        self.wrapEvent(event, data);
      }
    })
  },
  */

  recordEvent: function(method) {
    var self = this;
    self.app.history.recordEvent(self, method);
  },

  /*
  performAction: function(name, event, data) {
    var self = this;
    self.actions[name].redo(event, data);
  },
  */

  addAction: function(name, routines) {
    var self = this;
    //self.actions[name] = new EventAction(routines);
    self.actions[name] = routines;
  }

  /*
  recordAction: function(/* method, args... *\/) {
    this.app.recordAction(this, method, arguments);
  }
  */
}
$.export('SpriteEditor.Eventable', Eventable);

})(window.ender);