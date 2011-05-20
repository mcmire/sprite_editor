(function(window, document, $, undefined) {

  // The ElementMouseTracker tracks the mouse in the context of an element.
  // So, for instance, when we store the position of the mouse, we not only
  // store the position relative to the document, but also relative to the
  // element in question.
  //
  // To track the mouse in the context of an element, we can create a new
  // instance of ElementMouseTracker and attach some events to the element.
  // This is easily done with ElementMouseTracker.bind():
  //
  //   ElementMouseTracker.bind($element);
  //
  // When you no longer need to track the mouse with an element, you'll need
  // to detach these events. You can do this with ElementMouseTracker.unbind():
  //
  //   ElementMouseTracker.unbind($element);
  //
  var ElementMouseTracker = {
    instances: [],
    activeInstance: null,

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
          if (self.isDragging) self.activeInstance.trigger('mousedragstop');
          if (self.activeInstance) self.activeInstance.mouseup();
          self.activeInstance = null;
          //event.stopPropagation();
          event.preventDefault();
        },

        "mousemove.ElementMouseTracker": function(event) {
          self.pos = {x: event.pageX, y: event.pageY};
          if (self.activeInstance) self.activeInstance.mousemove();
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
    }
  };
  window.ElementMouseTracker = ElementMouseTracker;

  ElementMouseTracker.instance = function() {
    ElementMouseTracker.instance.prototype.init.apply(this, arguments);
  }
  ElementMouseTracker.instance.customizableEvents = {
    mousedragstop: 1,
    mousedragstart: 1,
    mousedrag: 1,
    mousedown: 1,
    mousedownordrag: 1,
  };
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
          if (ElementMouseTracker.instance.customizableEvents[k]) {
            self.customEvents[k] = v;
          }
        } else {
          self.options[k] = v;
        }
      })

      self._addEvents();

      // cache some values for later use
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

    trigger: function(eventName) {
      var self = this;
      if (self[eventName]) self[eventName]();
      self.$element.trigger(eventName);
    },

    getPosition: function() {
      return this.pos;
    },

    mousedragstop: function() {
      var self = this;
      self.isDragging = false;
    },

    mouseup: function() {
      var self = this;
      self.isDown = false;
      if (self.options.debug) {
        ElementMouseTracker.debugDiv().hide();
      }
    },

    mousemove: function() {
      var self = this;

      self._setMousePosition();

      // If dragging isn't set yet, set it until the mouse is lifted off
      if (self.isDown) {
        if (!self.isDragging) {
          self.isDragging = (!self.draggingDistance || self._distance(self.downAt, self.pos.abs) > self.options.draggingDistance);
          self.$element.trigger('mousedragstart');
        }
      } else {
        self.isDragging = false;
        self.$element.trigger('mouseglide');
      }

      if (self.isDragging) {
        self.$element.trigger('mousedrag');
        self.$element.trigger('mousedownordrag');
      }

      if (self.options.debug) {
        ElementMouseTracker.debugDiv().html(String.format("abs: ({0}, {1})<br/>rel: ({2}, {3})", self.pos.abs.x, self.pos.abs.y, self.pos.rel.x, self.pos.rel.y))
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
        "mousedown.ElementMouseTracker": function(event) {
          ElementMouseTracker.activeInstance = self;
          self.isDown = true;
          self._setMousePosition();
          self.downAt = {
            abs: {x: event.pageX, y: event.pageY},
            rel: {x: event.pageX - self.elementOffset.left, y: event.pageY - self.elementOffset.top}
          };
          self.$element.trigger('mousedownordrag');

          if (self.options.debug) {
            ElementMouseTracker.debugDiv().show();
          }

          //event.stopPropagation();
          event.preventDefault();
        }
      })

      $.v.each(self.customEvents, function(eventName, callback) {
        self.$element.bind(eventName+".ElementMouseTracker.custom", callback);
      })
    },

    _removeEvents: function() {
      var self = this;
      self.$element.unbind(".ElementMouseTracker"); // I hope this unbinds the .custom events...
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