(function(window, document, $, undefined) {

  // The ElementMouseTracker tracks the mouse in the context of an element,
  // and also provides a way to hook into dragging events.
  //
  // To track the mouse in the context of an element, we can create a new
  // instance of ElementMouseTracker and attach some events to the element.
  // This is easily done with ElementMouseTracker.bind():
  //
  //   ElementMouseTracker.bind($element);
  //
  // You may also pass an option hash to specify callbacks for mouse events
  // which will be called at the appropriate time. An example would be:
  //
  //   ElementMouseTracker.bind($element, {
  //     mousedragstart: function(event) {
  //       doSomethingBasedOnMousePos(self.pos);
  //     }
  //   });
  //
  // The list of possible mouse events not only includes native events and the
  // extra compatibility events that Bean provides, but also special events
  // which this class provides which are related to dragging. All of these
  // callbacks are executed whenever they occur on the element being tracked,
  // except for mouseup, which is executed on the document level, since we still
  // want that to occur even if the user's mouse moves outside of the element.
  // The possible events are:
  //
  //   mouseup
  //   mousedown
  //   mouseover
  //   mouseout
  //   mouseenter
  //   mouseleave
  //   mousemove
  //   mousedragstart
  //     Invoked the first time the mouse is being dragged, starting from the
  //     element
  //   mousedrag
  //     Invoked repeatedly while the mouse is being dragged within the element
  //   mousedragstop
  //     Invoked if the mouse was being dragged and is now released, or when it
  //     leaves the element
  //   mousedragordown / mousedownordrag
  //     Invoked once when the mouse is pressed down, or repeatedly when the
  //     mouse is being dragged across the element
  //   mouseglide
  //     Invoved repeatedly while the mouse is being moved over the element but
  //     not being dragged
  //
  // Your callback will be passed an event object, and the 'this' object inside
  // the callback will be set to the ElementMouseTracker instance, so you can
  // say `this.pos.rel`, for instance, to access the relative mouse coordinates.
  //
  // When you no longer need to track the mouse with an element, you'll need
  // to do some cleanup to detach these events. You can do this with
  // ElementMouseTracker.unbind():
  //
  //   ElementMouseTracker.unbind($element);
  //
  var ElementMouseTracker = {
    instances: [],
    activeInstance: {
      mouseWithin: null,
      mouseHeldWithin: null
    },

    init: function() {
      var self = this;

      // We bind these events to the document rather than of the element to
      // make it possible to do special behavior when the user moves the mouse
      // outside of the element in question. For instance, we definitely want
      // to trigger the mouseup event outside the element. As another example,
      // the ColorPickerBox widget has logic that keeps the hue/saturation
      // selector indicator inside the canvas for hue/saturation even if the
      // user moves the mouse outside of the canvas.
      //
      $(document).bind({
        "mouseup.ElementMouseTracker": function() {
          $.v.each(self.activeInstances(), function(inst) { inst.triggerHandler('mouseup', event) });
          var inst = self.activeInstance.mouseHeldWithin;
          if (inst && inst.isDragging) inst.trigger('mousedragstop');
          //event.stopPropagation();
          event.preventDefault();
        },

        "mousemove.ElementMouseTracker": function(event) {
          self.pos = {x: event.pageX, y: event.pageY};
          $.v.each(self.activeInstances(), function(inst) { inst.triggerHandler('mousemove', event) });
          //event.stopPropagation();
          event.preventDefault();
        }
      });
    },

    destroy: function() {
      var self = this;
      $(document).unbind(".ElementMouseTracker")
    },

    bind: function($element, options) {
      var self = this;

      if (self.instances.length == 0) self.init();

      var instance = new ElementMouseTracker.instance($element, options)
      self.instances.push(instance);

      return instance;
    },

    unbind: function($element) {
      var self = this;

      var index;
      // forEach doesn't let you break out of the loop?!?
      for (var i=0; i<self.instances.length; i++) {
        var instance = self.instances[i];
        if (instance.$element == $element) {
          index = i;
          break;
        }
      }

      instance.destroy();
      self.instances.splice(index, 1); // remove at index

      if (self.instances.length == 0) self.destroy();
    },

    debugDiv: function() {
      var self = this;
      if (self.$debugDiv) return self.$debugDiv;
      self.$debugDiv = $('<div "/>')
        .html("&nbsp;")
        .css({
          position: "absolute",
          top: 0,
          left: 0,
          padding: "2px",
          "background-color": "lightyellow",
          width: "200px",
          height: "50px"
        })
      $(document.body).append(self.$debugDiv);
      return self.$debugDiv;
    },

    activeInstances: function() {
      var self = this;
      var instances = [self.activeInstance.mouseHeldWithin, self.activeInstance.mouseWithin];
      return $.v(instances).chain().compact().uniq().value();
    }

    /*
    _trigger: function(/* eventName1, eventName2, ..., event *\/) {
      var self = this;
      var eventNames = Array.prototype.slice(arguments);
      var event = eventNames.pop();
      var instances = [self.activeInstance.mouseHeldWithin, self.activeInstance.mouseWithin];
      $.v(instances).chain().compact().uniq().each(function(instance) {
        $.v.each(eventNames, function(eventName) {
          instance.trigger.call(instance, eventName, event);
        })
      })
    }
    */
  };
  window.ElementMouseTracker = ElementMouseTracker;

  ElementMouseTracker.instance = function() {
    ElementMouseTracker.instance.prototype.init.apply(this, arguments);
  }
  ElementMouseTracker.instance.prototype = {
    $element: null,
    options: {},
    customEvents: {},

    pos: {
      abs: {x: null, y: null},
      rel: {x: null, y: null}
    },
    isDown: false,
    downAt: {
      abs: {x: null, y: null},
      rel: {x: null, y: null}
    },
    isDragging: false,

    init: function($element, options) {
      var self = this;

      self.$element = $element;
      $.v.each(options, function(k, v) {
        if (/^mouse/.test(k)) {
          self.customEvents[k] = v;
        } else {
          self.options[k] = v;
        }
      })

      self._addEvents();

      // Cache some values for later use
      self.elementOffset = self.$element.absoluteOffset();
      var computedStyle = self.$element.computedStyle();
      self.elementSize = {
        width: parseInt(computedStyle["width"], 10),
        height: parseInt(computedStyle["height"], 10)
      }
    },

    destroy: function() {
      var self = this;
      self._removeEvents();
    },

    trigger: function(eventName, event) {
      var self = this;
      // Trigger the handlers not attached to the element
      self.triggerHandler(eventName, event);
      // Invoke the native event we've attached to the element ourselves below
      self.$element.trigger(eventName);
    },

    triggerHandler: function(eventName, event) {
      var self = this;
      if (/(up|stop|leave)$/.test(eventName)) {
        // Invoke the callback which was given in the options
        if (self.customEvents[eventName]) self.customEvents[eventName].call(self, event);
        // Invoke the callback which is a method on this instance
        if (self[eventName]) self[eventName].call(self, event);
      } else {
        // Invoke the callback which is a method on this instance
        if (self[eventName]) self[eventName].call(self, event);
        // Invoke the callback which was given in the options
        if (self.customEvents[eventName]) self.customEvents[eventName].call(self, event);
      }
    },

    getPosition: function() {
      return this.pos;
    },

    mousemove: function(event) {
      var self = this;

      self._setMousePosition();

      // If dragging isn't set yet, set it until the mouse is lifted off
      if (self.isDown) {
        if (!self.isDragging) {
          self.isDragging = (!self.draggingDistance || self._distance(self.downAt, self.pos.abs) > self.options.draggingDistance);
          self.trigger('mousedragstart', event);
        }
      } else {
        self.isDragging = false;
        self.trigger('mouseglide', event);
      }

      if (self.isDragging) {
        self.trigger('mousedrag', event);
        self.trigger('mousedownordrag', event);
        self.trigger('mousedragordown', event);
      }

      if (self.options.debug) {
        ElementMouseTracker.debugDiv().html(String.format("abs: ({0}, {1})<br/>rel: ({2}, {3})", self.pos.abs.x, self.pos.abs.y, self.pos.rel.x, self.pos.rel.y))
      }
    },

    mousedragstop: function(event) {
      var self = this;
      self.isDragging = false;
    },

    mouseup: function(event) {
      var self = this;
      self.isDown = false;
      delete ElementMouseTracker.activeInstance.mouseHeldWithin;
      if (self.options.debug) {
        ElementMouseTracker.debugDiv().hide();
      }
    },

    _setMousePosition: function() {
      var self = this;
      self.pos = {
        abs: ElementMouseTracker.pos,
        rel: {x: event.pageX - self.elementOffset.left, y: event.pageY - self.elementOffset.top}
      };
      // Correct the position if it's outside the bounds of the element
      if (self.pos.rel.x < 0) {
        self.pos.rel.x = 0;
      } else if (self.pos.rel.x > self.elementSize.width) {
        self.pos.rel.x = self.elementSize.width;
      }
      if (self.pos.rel.y < 0) {
        self.pos.rel.y = 0;
      } else if (self.pos.rel.y > self.elementSize.height) {
        self.pos.rel.y = self.elementSize.height
      }
    },

    _addEvents: function() {
      var self = this;

      self.$element.bind({
        "mouseenter.ElementMouseTracker": function(event) {
          ElementMouseTracker.activeInstance.mouseWithin = self;
        },

        "mouseleave.ElementMouseTracker": function(event) {
          delete ElementMouseTracker.activeInstance.mouseWithin;
        },

        "mousedown.ElementMouseTracker": function(event) {
          ElementMouseTracker.activeInstance.mouseHeldWithin = self;
          self.isDown = true;
          self._setMousePosition();
          self.downAt = {
            abs: {x: event.pageX, y: event.pageY},
            rel: {x: event.pageX - self.elementOffset.left, y: event.pageY - self.elementOffset.top}
          };
          self.trigger('mousedownordrag', event);
          self.trigger('mousedragordown', event);

          if (self.options.debug) {
            ElementMouseTracker.debugDiv().show();
          }

          //event.stopPropagation();
          event.preventDefault();
        }
      })
    },

    _removeEvents: function() {
      var self = this;
      self.$element.unbind(".ElementMouseTracker");
    },

    _distance: function(v1, v2) {
      return Math.sqrt(Math.pow((v2.y - v1.y), 2) + Math.pow((v2.x - v1.x), 2));
    }
  }

  $.ender({
    mouseTracker: function(options) {
      var mouseTracker;
      if (this.data('mouseTracker')) {
        mouseTracker = this.data('mouseTracker');
      } else {
        mouseTracker = ElementMouseTracker.bind(this, arguments[0]);
        this.data('mouseTracker', mouseTracker);
      }

      if (typeof arguments[0] == 'string') {
        if (arguments[0] == 'destroy') {
          ElementMouseTracker.unbind(this);
          this.data('mouseTracker', null);
        } else if (typeof mouseTracker[arguments[0]] === 'function') {
          return mouseTracker[arguments[0]].apply( mouseTracker, Array.prototype.slice.call(arguments, 1) );
        } else {
          throw "Couldn't find function '"+arguments[0]+"'!"
        }
      }

      return this;
    }
  }, true)

})(window, window.document, window.ender);