(function(window, document, $, undefined) {

/*!
 * The ElementMouseTracker tracks the mouse in the context of an element by
 * binding events to it and then storing information such as the mouse position
 * and whether or not the mouse is being dragged within the element. It also
 * provides a way to hook into dragging events.
 */
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
      "mouseup.ElementMouseTracker": function(event) {
        var inst = self.activeInstance.mouseHeldWithin;
        if (inst && inst.isDragging) {
          inst.triggerHandler('mousedragstop');
        }
        $.v.each(self.activeInstances(), function(inst) {
          inst.triggerHandler('mouseup', event)
        });
        //event.stopPropagation();
        event.preventDefault();
      },
      "mousemove.ElementMouseTracker": function(event) {
        self.pos = {x: event.pageX, y: event.pageY};
        $.v.each(self.activeInstances(), function(inst) {
          inst.triggerHandler('mousemove', event);
        });
        //event.stopPropagation();
        event.preventDefault();
      }
    });
  },

  destroy: function() {
    var self = this;
    $(document).unbind([
      "mouseup.ElementMouseTracker",
      "mousemove.ElementMouseTracker"
    ].join(" "));
    self.debugDiv().hide();
  },

  /*!
   * Starts tracking the mouse in the context of an element.
   *
   * We first wrap the given element in an instance of the
   * ElementMouseTracker.instance class, which takes care of binding
   * mouse-related event handlers to the element. Since multiple elements may
   * be bound at the same time, we then store this instance in an array so
   * that we have access to it later.
   *
   * You may specify an option hash to customize the events which are bound
   * on the element. The list of possible events not only includes native
   * events and the extra cross-browser-compatible events that Bean provides,
   * but also special events which are related to dragging. All of these
   * handlers are executed whenever they occur on the element being tracked,
   * except for mouseup, which is executed on the document level, as we
   * still want that to occur even if the user's mouse moves outside of the
   * element. Here is the full list of events:
   *
   *   mouseup
   *   mousedown
   *   mouseover
   *   mouseout
   *   mouseenter
   *   mouseleave
   *   mousemove
   *   mousedragstart
   *     Invoked the first time the mouse is being dragged, starting from the
   *     element
   *   mousedrag
   *     Invoked repeatedly while the mouse is being dragged within the element
   *   mousedragstop
   *     Invoked if the mouse was being dragged and is now released, or when it
   *     leaves the element
   *   mouseglide
   *     Invoved repeatedly while the mouse is being moved over the element but
   *     not being dragged
   *
   * The custom dragging events are derived from either mousemove or mouseup,
   * so you still have access to an event object, which will be passed to
   * your handler function as with the other events.
   *
   * Returns the instance of ElementMouseTracker.instance. You'll want to
   * store this somewhere so you can destroy it later.
   */
  add: function($element, options) {
    var self = this;

    if (self.instances.length == 0) self.init();

    var instance = new ElementMouseTracker.instance($element, options)
    self.instances.push(instance);

    return instance;
  },

  /*!
   * Given an instance of ElementMouseTracker.instance previously obtained from
   * add(), does some cleanup to remove the event handlers from the associated
   * element and then remove the instance from the instances array.
   */
  remove: function(instance) {
    var self = this;

    var index = $.v.indexOf(self.instances, instance);
    instance.destroy();
    self.instances.splice(index, 1); // remove at index
    if (self.activeInstance.mouseWithin == instance) {
      delete self.activeInstance.mouseWithin;
    }
    if (self.activeInstance.mouseHeldWithin == instance) {
      delete self.activeInstance.mouseHeldWithin;
    }

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
};
ElementMouseTracker.instance = function($element, options) {
  var self = this;

  self.$element = $element;
  self.options = {};
  self.customEvents = {};
  $.v.each(options, function(keys, val) {
    $.v.each(keys.split(" "), function(key) {
      if (/^mouse/.test(key)) {
        self.customEvents[key] = val;
      } else {
        self.options[key] = val;
      }
    })
  })
  // default options
  if (typeof self.options.draggingDistance == "undefined") {
    self.options.draggingDistance = 1;
  }

  self.pos = {
    abs: {x: null, y: null},
    rel: {x: null, y: null}
  };
  self.isDown = false;
  self.downAt = {
    abs: {x: null, y: null},
    rel: {x: null, y: null}
  };
  self.isDragging = false;

  self._addEvents();

  // Cache some values for later use
  self.elementOffset = self.$element.absoluteOffset();
  var computedStyle = self.$element.computedStyle();
  self.elementSize = {
    width: parseInt(computedStyle["width"], 10),
    height: parseInt(computedStyle["height"], 10)
  }
};
ElementMouseTracker.instance.prototype = {
  destroy: function() {
    var self = this;
    self._removeEvents();
  },

  /*
  trigger: function(eventName, event) {
    var self = this;
    // Trigger the handlers not attached to the element
    self.triggerHandler(eventName, event);
    // Invoke the native event we've attached to the element ourselves below
    self.$element.trigger(eventName);
  },
  */

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

  mousemove: function(event) {
    var self = this;

    self._setMousePosition();

    // If dragging isn't set yet, set it until the mouse is lifted off
    if (self.isDown) {
      if (!self.isDragging) {
        var dist = self._distance(self.downAt.abs, self.pos.abs);
        self.isDragging = (dist >= self.options.draggingDistance);
        self.triggerHandler('mousedragstart', event);
      }
    } else {
      self.isDragging = false;
      self.triggerHandler('mouseglide', event);
    }

    if (self.isDragging) {
      self.triggerHandler('mousedrag', event);
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
      "mouseover.ElementMouseTracker": function(event) {
        self.triggerHandler('mouseover', event);
      },

      "mouseout.ElementMouseTracker": function(event) {
        self.triggerHandler('mouseout', event);
      },

      "mouseenter.ElementMouseTracker": function(event) {
        ElementMouseTracker.activeInstance.mouseWithin = self;
        self.triggerHandler('mouseenter', event);
      },

      "mouseleave.ElementMouseTracker": function(event) {
        delete ElementMouseTracker.activeInstance.mouseWithin;
        self.triggerHandler('mouseleave', event);
      },

      "mousedown.ElementMouseTracker": function(event) {
        ElementMouseTracker.activeInstance.mouseHeldWithin = self;
        self.isDown = true;
        self._setMousePosition();
        self.downAt = {
          abs: {x: event.pageX, y: event.pageY},
          rel: {x: event.pageX - self.elementOffset.left, y: event.pageY - self.elementOffset.top}
        };

        if (self.options.debug) {
          ElementMouseTracker.debugDiv().show();
        }

        self.triggerHandler('mousedown', event);

        //event.stopPropagation();
        event.preventDefault();
      },

      "click.ElementMouseTracker": function(event) {
        self.triggerHandler('mouseclick', event);
        // Prevent things on the page from being selected
        event.preventDefault();
      },

      "contextmenu.ElementMouseTracker": function(event) {
        self.triggerHandler('contextmenu', event);
        // Prevent things on the page from being selected
        event.preventDefault();
      }
    })
  },

  _removeEvents: function() {
    var self = this;
    // Grr, Bean doesn't let you do unbind(".ElementMouseTracker") yet
    self.$element.unbind([
      "mouseover.ElementMouseTracker",
      "mouseout.ElementMouseTracker",
      "mouseenter.ElementMouseTracker",
      "mouseleave.ElementMouseTracker",
      "mousedown.ElementMouseTracker",
      "click.ElementMouseTracker",
      "contextmenu.ElementMouseTracker"
    ].join(" "));
  },

  _distance: function(v1, v2) {
    return Math.floor(Math.sqrt(Math.pow((v2.y - v1.y), 2) + Math.pow((v2.x - v1.x), 2)));
  }
}
$.export('SpriteEditor.ElementMouseTracker', ElementMouseTracker);

$.ender({
  mouseTracker: function() {
    var mouseTracker;
    if (this.data('mouseTracker')) {
      mouseTracker = this.data('mouseTracker');
    } else if ($.v.is.obj(arguments[0])) {
      mouseTracker = ElementMouseTracker.add(this, arguments[0]);
      this.data('mouseTracker', mouseTracker);
    }

    if (typeof arguments[0] == 'string') {
      if (arguments[0] == 'destroy') {
        ElementMouseTracker.remove(mouseTracker);
        this.data('mouseTracker', null);
      } else if (arguments[0] == '__instance__') {
        return mouseTracker;
      } else {
        var value = mouseTracker[arguments[0]];
        if (typeof value == 'function') {
          return value.apply( mouseTracker, Array.prototype.slice.call(arguments, 1) );
        } else if (typeof value != 'undefined') {
          return value;
        } else {
          throw "'"+arguments[0]+"' is not a property of ElementMouseTracker!"
        }
      }
    }

    return this;
  }
}, true)

})(window, window.document, window.ender);