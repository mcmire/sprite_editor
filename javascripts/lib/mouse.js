(function(window, document, $, undefined) {

  var Mouse = {
    instances: [],
    pos: {x: null, y: null},
    isDown: false,
    downAt: {x: null, y: null},
    isDragging: false,
    draggingDistance: null,

    init: function(initialInstance) {
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
        "mouseup.Mouse": function() {
          if (self.isDragging) {
            self._trigger('mousedragstop');
            self.isDragging = false;
          }
          self.isDown = false;
          //event.stopPropagation();
          event.preventDefault();
        },
        "mousedown.Mouse": function(event) {
          self.isDown = true;
          self.downAt = {x: event.pageX, y: event.pageY};
          self._trigger('mousedownordrag');
          //event.stopPropagation();
          event.preventDefault();
        },
        /*
        "mouseout.Mouse": function(event) {
          self.isDown = false;
          self.downAt = null;
        },
        */
        "mousemove.Mouse": function(event) {
          self.pos = {x: event.pageX, y: event.pageY};

          // If dragging isn't set yet, set it until the mouse is lifted off
          if (self.isDown) {
            if (!self.isDragging) {
              self.isDragging = (!self.draggingDistance || self._distance(self.downAt, self.pos) > self.draggingDistance);
              self._trigger('mousedragstart');
            }
          } else {
            self.isDragging = false;
            self._trigger('mouseglide');
          }

          if (Mouse.debug) {
            self.debugDiv().html(String.format("abs: ({0}, {1})", self.pos.x, self.pos.y));
          }

          //event.stopPropagation();
          event.preventDefault();
        }
      });
    },

    destroy: function() {
      var self = this;
      $(document).unbind(".Mouse")
    },

    bind: function($element, options) {
      var self = this;
      // apply the global events first if necessary, then the events for this instance
      if (self.instances.length == 0) self.init();
      var instance = new Mouse.instance($element, options);
      $element.data('mouse', instance);
      self.instances.push(instance);
      return instance;
    },

    unbind: function($element) {
      var self = this;
      var instance = self.for($element);
      instance.destroy();
      $element.data('mouse', null);
      self.instances.splice(instance, $.v.indexOf(self.instances, instance));
      if (self.instances.length == 0) self.destroy();
    },

    for: function($element) {
      return $element.data('mouse');
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

    _trigger: function(eventName) {
      var self = this;
      $.v.each(self.instances, function(i) { i.$element.trigger(eventName) })
    },

    _distance: function(v1, v2) {
      return Math.sqrt(Math.pow((v2.y - v1.y), 2) + Math.pow((v2.x - v1.x), 2));
    }
  };

  Mouse.instance = function() {
    Mouse.instance.prototype.init.apply(this, arguments);
  }
  $.extend(Mouse.instance.prototype, {
    $element: null,
    options: {},
    customEvents: {},
    pos: {x: null, y: null},
    downAt: {x: null, y: null},

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

    _addEvents: function() {
      var self = this;
      self._wrappedOnMouseMove = function() {
        self._onMouseMove.apply(self, arguments);
      }
      $(document).bind({
        // We bind this on the document so that we can test whether the mouse
        // is being dragged inside the element
        "mousemove.Mouse-instance": self._wrappedOnMouseMove
      })
      self.$element.bind({
        "mousedown.Mouse": function(event) {
          self.downAt = {x: event.pageX - self.elementOffset.left, y: event.pageY - self.elementOffset.top}
        }
      })
      $.v.each(self.customEvents, function(eventName, callback) {
        (/^(mouseup|mousemove)$/.test(eventName) ? $(document) : self.$element).bind(eventName+".Mouse-instance", callback);
      })
    },

    _removeEvents: function() {
      var self = this;
      $(document).unbind("mousemove.Mouse-instance", self._wrappedOnMouseMove);
      self.$element.unbind(".Mouse-instance");
    },

    _onMouseMove: function(event) {
      var self = this;

      self.pos = {x: event.pageX - self.elementOffset.left, y: event.pageY - self.elementOffset.top};

      // Correct the position if it's outside the bounds of the element
      if (self.pos.x < 0) {
        self.pos.x = 0;
      } else if (self.pos.x > self.elementSize.width) {
        self.pos.x = self.elementSize.width;
      }
      if (self.pos.y < 0) {
        self.pos.y = 0;
      } else if (self.pos.y > self.elementSize.height) {
        self.pos.y = self.elementSize.height
      }

      if (Mouse.isDragging) {
        self.$element.trigger('mousedrag');
        self.$element.trigger('mousedownordrag');
      }
      if (Mouse.debug || self.options.debug) {
        Mouse.debugDiv().html(String.format("abs: ({0}, {1})<br/>rel: ({2}, {3})", Mouse.pos.x, Mouse.pos.y, self.pos.x, self.pos.y))
      }
    }
  })
  window.Mouse = Mouse;

  $.ender({
    mouseTracking: function(options) {
      if (typeof options == 'string' && options == 'destroy') {
        Mouse.unbind(this);
      } else {
        Mouse.bind(this, options);
      }
    }
  }, true);

})(window, window.document, window.ender);