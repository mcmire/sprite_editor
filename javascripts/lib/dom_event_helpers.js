(function($, undefined) {

var mixin = {
  _bindEvents: function(elem, events) {
    var self = this;
    var namespacedEvents = {};
    $.v.each(events, function(name, fn) {
      namespacedEvents[name+"."+self.eventNamespace] = fn;
    })
    $(elem).bind(namespacedEvents);
  },

  _unbindEvents: function() {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    var elem = $(args.shift());
    var namespacedEventNames = $.v.map(args, function(name) {
      return name+"."+self.eventNamespace;
    });
    $(elem).unbind(namespacedEventNames.join(" "));
  }
};

var DOMEventHelpers = {
  mixin: function(obj, eventNamespace) {
    $.extend(obj, mixin);
    obj.eventNamespace = eventNamespace;
  }
}
$.export('SpriteEditor.DOMEventHelpers', DOMEventHelpers);

})(window.ender);