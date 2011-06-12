(function($, undefined) {

var EventHistory = {
  eventGroups: [],
  currentEventGroup: null,
  currentIndex: -1,

  init: function(app) {
    var self = this;
    self.app = app;
    return self;
  },

  /*
  createEvent: function(fn) {
    return {
      before: {me: {}},
      after: {me: {}}
    };
  },
  */

  /*
  recordEvent: function(obj, method, data, options) {
    var self = this;
    var options = options || {};
    var action = obj.actions[method];
    if (self.eventBeingRecorded) {
      self._callAction(obj, action, self.eventBeingRecorded, data, options);
    } else {
      var event = self.eventBeingRecorded = self.createEvent();
      self._callAction(obj, action, event, data, options);
      if (self.currentIndex > 0) {
        self.events.length = self.currentIndex;
      }
      self.events[self.events.length] = {object: obj, action: action, event: event, data: data};
      self.currentIndex++;
      self.eventBeingRecorded = null;
    }
  },
  */

  openEventGroup: function() {
    var self = this;
    if (self.currentEventGroup != null) {
      return;
    }
    self.currentEventGroup = [];
  },

  recordEvent: function(obj, method) {
    var self = this;
    var action = obj.actions[method];
    var hadEventGroupOpen = (self.currentEventGroup != null);
    if (!hadEventGroupOpen) {
      self.openEventGroup();
    }
    var event = action.do();
    self.currentEventGroup.push({object: obj, method: method, action: action, event: event});
    if (!hadEventGroupOpen) {
      self.closeEventGroup();
    }
  },

  closeEventGroup: function() {
    var self = this;
    if (self.currentEventGroup == null || self.currentEventGroup.length == 0) {
      return;
    }
    if (self.currentIndex > 0) {
      self.eventGroups.length = self.currentIndex;
    }
    self.eventGroups[self.eventGroups.length] = self.currentEventGroup;
    self.currentEventGroup = null;
    self.currentIndex = self.eventGroups.length-1;
  },

  undo: function() {
    var self = this;
    var events = self.eventGroups[self.currentIndex];
    //e.action.undo(e.event.before, e.data);
    $.v.each(events, function(e) { e.action.undo(e.event) })
    self.currentIndex--;
  },
  canUndo: function() {
    var self = this;
    return (self.currentIndex > -1);
  },

  redo: function() {
    var self = this;
    var events = self.eventGroups[self.currentIndex+1];
    //e.action.redo(e.event.after, e.data);
    $.v.each(events, function(e) { e.action.redo(e.event) })
    self.currentIndex++;
  },
  canRedo: function() {
    var self = this;
    return (self.currentIndex < self.eventGroups.length-1);
  },

  /*
  _callAction: function(obj, action, event, data, options) {
    if (options.before) options.before(event.before);
    if (action.do) {
      action.do(event, data, options);
    } else {
      if (options.on) options.on();
      action.redo.call(self, event.before, data);
    }
    if (options.after) options.after(event.after);
  },
  */

  // TODO: Needed anymore?
  /*
  recordAction: function(obj, method, args) {
    var self = this;
    obj[method].apply(obj, args);
    self.currentEvent.push([obj, method, args]);
  }
  */
};
$.export('SpriteEditor.EventHistory', EventHistory);

})(window.ender);